const prisma = require('../config/db');

/**
 * GET /api/cases/:id/payments
 */
async function getCasePayments(req, res, next) {
  try {
    const { id } = req.params;

    const caseRecord = await prisma.case.findUnique({ where: { id } });
    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    // Client isolation check
    if (req.user.role === 'CLIENT' && caseRecord.clientId !== req.clientId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const payments = await prisma.payment.findMany({
      where: { caseId: id },
      include: {
        recordedBy: { select: { id: true, name: true, role: true } }
      },
      orderBy: { paymentDate: 'desc' }
    });

    return res.status(200).json({
      success: true,
      caseNumber: caseRecord.caseNumber,
      totalFee: caseRecord.totalFee,
      amountPaid: caseRecord.amountPaid,
      outstandingAmount: caseRecord.outstandingAmount,
      payments
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cases/:id/payments
 * Record a payment for a case and recalculate fee totals
 */
async function recordPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, referenceNumber, notes, paymentDate } = req.body;

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    const caseRecord = await prisma.case.findUnique({ where: { id } });
    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    // Database transaction to update payment & case financial totals
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          caseId: id,
          amount: paymentAmount,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          paymentMethod: paymentMethod || 'Bank Transfer',
          referenceNumber: referenceNumber || null,
          notes: notes || null,
          recordedById: req.user.id
        }
      });

      // 2. Aggregate all payments for this case to ensure precision
      const aggregate = await tx.payment.aggregate({
        where: { caseId: id },
        _sum: { amount: true }
      });

      const totalPaid = Number(aggregate._sum.amount || 0);
      const totalFee = Number(caseRecord.totalFee);
      const outstandingAmount = Math.max(0, totalFee - totalPaid);

      // 3. Update Case financial fields
      const updatedCase = await tx.case.update({
        where: { id },
        data: {
          amountPaid: totalPaid,
          outstandingAmount: outstandingAmount
        }
      });

      // 4. Log Activity
      await tx.activityLog.create({
        data: {
          caseId: id,
          userId: req.user.id,
          action: 'PAYMENT_RECORDED',
          entity: 'Payment',
          entityId: payment.id,
          metadata: JSON.stringify({ amount: paymentAmount, ref: referenceNumber, outstanding: outstandingAmount })
        }
      });

      return { payment, updatedCase };
    });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      payment: result.payment,
      caseFinancials: {
        totalFee: result.updatedCase.totalFee,
        amountPaid: result.updatedCase.amountPaid,
        outstandingAmount: result.updatedCase.outstandingAmount
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/payments
 * Get all payments across system (Staff/Admin)
 */
async function getAllPayments(req, res, next) {
  try {
    const where = {};
    if (req.user.role === 'CLIENT') {
      where.case = { clientId: req.clientId };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            totalFee: true,
            outstandingAmount: true,
            client: { select: { companyName: true } }
          }
        },
        recordedBy: { select: { name: true } }
      },
      orderBy: { paymentDate: 'desc' }
    });

    return res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCasePayments,
  recordPayment,
  getAllPayments
};
