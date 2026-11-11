const prisma = require('../config/db');

/**
 * GET /api/dashboard/summary
 * Returns real database statistics based on authenticated user role
 */
async function getDashboardSummary(req, res, next) {
  try {
    const { role } = req.user;

    if (role === 'CLIENT') {
      const clientId = req.clientId;

      // 1. Client active cases
      const activeCasesCount = await prisma.case.count({
        where: { clientId, status: { notIn: ['COMPLETED', 'REJECTED'] } }
      });

      // 2. Client pending document uploads
      const pendingDocsCount = await prisma.caseDocument.count({
        where: { case: { clientId }, status: { in: ['PENDING', 'REJECTED'] } }
      });

      // 3. Client total outstanding payment
      const caseFinancials = await prisma.case.aggregate({
        where: { clientId },
        _sum: { totalFee: true, amountPaid: true, outstandingAmount: true }
      });

      // 4. Client upcoming renewal
      const upcomingRenewal = await prisma.renewal.findFirst({
        where: { case: { clientId } },
        orderBy: { expiryDate: 'asc' },
        include: { service: { select: { name: true } }, case: { select: { caseNumber: true } } }
      });

      // 5. Client active cases list
      const clientCases = await prisma.case.findMany({
        where: { clientId },
        include: {
          service: { select: { name: true, category: true } },
          _count: { select: { documents: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      });

      // 6. Client recent updates
      const recentUpdates = await prisma.caseComment.findMany({
        where: { case: { clientId }, visibility: 'CLIENT_VISIBLE' },
        include: { case: { select: { caseNumber: true, title: true } }, author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      return res.status(200).json({
        success: true,
        role: 'CLIENT',
        summary: {
          activeCases: activeCasesCount,
          pendingDocuments: pendingDocsCount,
          totalOutstandingFee: Number(caseFinancials._sum.outstandingAmount || 0),
          totalPaidFee: Number(caseFinancials._sum.amountPaid || 0),
          upcomingRenewal
        },
        cases: clientCases,
        recentUpdates
      });
    }

    // ADMIN / MANAGER / STAFF DASHBOARD METRICS

    // 1. Core KPIs
    const totalLeads = await prisma.lead.count();
    const activeClients = await prisma.client.count({ where: { status: 'ACTIVE' } });
    const activeCases = await prisma.case.count({ where: { status: { notIn: ['COMPLETED'] } } });
    const pendingDocuments = await prisma.caseDocument.count({ where: { status: { in: ['PENDING', 'UPLOADED', 'UNDER_REVIEW'] } } });
    
    const financialTotals = await prisma.case.aggregate({
      _sum: { totalFee: true, amountPaid: true, outstandingAmount: true }
    });

    const upcomingRenewalsCount = await prisma.renewal.count({
      where: { renewalStatus: { in: ['EXPIRING_SOON', 'RENEWAL_DUE'] } }
    });

    // 2. Cases by Status (Pie / Donut chart distribution)
    const casesByStatusRaw = await prisma.case.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const casesByStatus = casesByStatusRaw.map(item => ({
      status: item.status,
      count: item._count.id
    }));

    // 3. Cases by Service (Bar chart)
    const casesByServiceRaw = await prisma.case.groupBy({
      by: ['serviceId'],
      _count: { id: true }
    });

    const services = await prisma.service.findMany({ select: { id: true, name: true } });
    const serviceMap = new Map(services.map(s => [s.id, s.name]));

    const casesByService = casesByServiceRaw.map(item => ({
      serviceName: serviceMap.get(item.serviceId) || 'Other',
      count: item._count.id
    }));

    // 4. Lead Conversion Pipeline Metrics
    const leadsByStatusRaw = await prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const leadPipeline = leadsByStatusRaw.map(item => ({
      stage: item.status,
      count: item._count.id
    }));

    // 5. Overdue / Pending Document Action Table
    const overdueDocuments = await prisma.caseDocument.findMany({
      where: { status: { in: ['UPLOADED', 'UNDER_REVIEW', 'REJECTED'] } },
      include: {
        case: { select: { id: true, caseNumber: true, client: { select: { companyName: true } } } },
        checklistItem: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    });

    // 6. Upcoming Renewals Action Table
    const upcomingRenewalsList = await prisma.renewal.findMany({
      include: {
        case: { select: { caseNumber: true, client: { select: { companyName: true } } } },
        service: { select: { name: true } }
      },
      orderBy: { expiryDate: 'asc' },
      take: 6
    });

    // 7. Staff Workload
    const staffWorkloadRaw = await prisma.case.groupBy({
      by: ['assignedStaffId'],
      _count: { id: true }
    });

    const staffUsers = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'MANAGER'] } },
      select: { id: true, name: true }
    });
    const staffMap = new Map(staffUsers.map(s => [s.id, s.name]));

    const staffWorkload = staffWorkloadRaw
      .filter(item => item.assignedStaffId)
      .map(item => ({
        staffName: staffMap.get(item.assignedStaffId) || 'Unassigned',
        caseCount: item._count.id
      }));

    return res.status(200).json({
      success: true,
      role,
      summary: {
        totalLeads,
        activeClients,
        activeCases,
        pendingDocuments,
        totalRevenue: Number(financialTotals._sum.amountPaid || 0),
        outstandingPayments: Number(financialTotals._sum.outstandingAmount || 0),
        upcomingRenewals: upcomingRenewalsCount
      },
      charts: {
        casesByStatus,
        casesByService,
        leadPipeline,
        staffWorkload
      },
      tables: {
        overdueDocuments,
        upcomingRenewalsList
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary
};
