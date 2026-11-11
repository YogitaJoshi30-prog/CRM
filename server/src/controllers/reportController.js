const prisma = require('../config/db');

/**
 * GET /api/reports/performance
 */
async function getPerformanceReport(req, res, next) {
  try {
    const totalCases = await prisma.case.count();
    const completedCases = await prisma.case.count({ where: { status: 'COMPLETED' } });
    const pendingCases = await prisma.case.count({ where: { status: { in: ['DOCUMENTS_PENDING', 'DOCUMENTS_RECEIVED', 'SUBMITTED', 'UNDER_REVIEW'] } } });

    const totalLeads = await prisma.lead.count();
    const wonLeads = await prisma.lead.count({ where: { status: 'WON' } });
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

    const financialTotals = await prisma.case.aggregate({
      _sum: { totalFee: true, amountPaid: true, outstandingAmount: true }
    });

    const casesByService = await prisma.case.groupBy({
      by: ['serviceId'],
      _count: { id: true },
      _sum: { totalFee: true, amountPaid: true }
    });

    const services = await prisma.service.findMany({ select: { id: true, name: true, category: true } });
    const serviceMap = new Map(services.map(s => [s.id, s]));

    const serviceBreakdown = casesByService.map(item => {
      const s = serviceMap.get(item.serviceId) || {};
      return {
        serviceName: s.name || 'Unknown',
        category: s.category || 'General',
        totalCases: item._count.id,
        totalRevenue: Number(item._sum.amountPaid || 0),
        totalBilled: Number(item._sum.totalFee || 0)
      };
    });

    return res.status(200).json({
      success: true,
      report: {
        totalCases,
        completedCases,
        pendingCases,
        totalLeads,
        wonLeads,
        conversionRate: `${conversionRate}%`,
        totalBilled: Number(financialTotals._sum.totalFee || 0),
        totalCollected: Number(financialTotals._sum.amountPaid || 0),
        outstandingBalance: Number(financialTotals._sum.outstandingAmount || 0),
        serviceBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/export-csv
 * Generates and streams actual database CSV export
 */
async function exportCsv(req, res, next) {
  try {
    const { type } = req.query; // 'cases', 'clients', 'payments', 'leads'

    let csvContent = '';

    if (type === 'clients') {
      const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
      csvContent = 'Client ID,Company Name,Contact Person,Email,Phone,GSTIN,PAN,Status,Created At\n';
      clients.forEach(c => {
        csvContent += `"${c.id}","${c.companyName}","${c.contactPerson}","${c.email}","${c.phone || ''}","${c.gstin || ''}","${c.pan || ''}","${c.status}","${c.createdAt.toISOString()}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="clients_report.csv"');
      return res.status(200).send(csvContent);
    }

    if (type === 'leads') {
      const leads = await prisma.lead.findMany({
        include: { assignedStaff: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });
      csvContent = 'Lead ID,Name,Company Name,Email,Phone,Source,Service Name,Status,Assigned Staff,Created At\n';
      leads.forEach(l => {
        csvContent += `"${l.id}","${l.name}","${l.companyName}","${l.email}","${l.phone || ''}","${l.source || ''}","${l.serviceName || ''}","${l.status}","${l.assignedStaff ? l.assignedStaff.name : 'Unassigned'}","${l.createdAt.toISOString()}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leads_report.csv"');
      return res.status(200).send(csvContent);
    }

    if (type === 'payments') {
      const payments = await prisma.payment.findMany({
        include: { case: { select: { caseNumber: true, client: { select: { companyName: true } } } } },
        orderBy: { paymentDate: 'desc' }
      });
      csvContent = 'Payment ID,Case Number,Company Name,Amount (INR),Payment Date,Method,Reference Number\n';
      payments.forEach(p => {
        csvContent += `"${p.id}","${p.case.caseNumber}","${p.case.client.companyName}","${p.amount}","${p.paymentDate.toISOString()}","${p.paymentMethod}","${p.referenceNumber || ''}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="payments_report.csv"');
      return res.status(200).send(csvContent);
    }

    // Default: Cases export
    const cases = await prisma.case.findMany({
      include: {
        client: { select: { companyName: true } },
        service: { select: { name: true } },
        assignedStaff: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    csvContent = 'Case Number,Title,Client,Service,Status,Priority,Total Fee,Amount Paid,Outstanding Amount,Assigned Staff,Created At\n';
    cases.forEach(c => {
      csvContent += `"${c.caseNumber}","${c.title}","${c.client.companyName}","${c.service.name}","${c.status}","${c.priority}","${c.totalFee}","${c.amountPaid}","${c.outstandingAmount}","${c.assignedStaff ? c.assignedStaff.name : 'Unassigned'}","${c.createdAt.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cases_report.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPerformanceReport,
  exportCsv
};
