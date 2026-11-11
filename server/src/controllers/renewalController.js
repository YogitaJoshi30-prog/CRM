const prisma = require('../config/db');

/**
 * Helper function to calculate real-time renewal status based on days to expiry
 */
function calculateRenewalStatus(expiryDate) {
  if (!expiryDate) return 'ACTIVE';
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 7) return 'RENEWAL_DUE';
  if (diffDays <= 30) return 'EXPIRING_SOON';
  return 'ACTIVE';
}

/**
 * GET /api/renewals
 */
async function getRenewals(req, res, next) {
  try {
    const { status, days } = req.query;

    const where = {};

    if (req.user.role === 'CLIENT') {
      where.case = { clientId: req.clientId };
    } else {
      if (status) {
        where.renewalStatus = status;
      }
    }

    const renewals = await prisma.renewal.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            client: { select: { id: true, companyName: true, contactPerson: true, email: true } },
            assignedStaff: { select: { name: true } }
          }
        },
        service: { select: { id: true, name: true, category: true } }
      },
      orderBy: { expiryDate: 'asc' }
    });

    // Dynamically recalculate and enrich renewal statuses
    const enrichedRenewals = renewals.map(ren => {
      const computedStatus = calculateRenewalStatus(ren.expiryDate);
      const diffDays = Math.ceil((new Date(ren.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return {
        ...ren,
        computedStatus,
        daysUntilExpiry: diffDays
      };
    });

    let filtered = enrichedRenewals;
    if (days) {
      const numDays = Number(days);
      filtered = enrichedRenewals.filter(r => r.daysUntilExpiry <= numDays);
    }

    return res.status(200).json({ success: true, count: filtered.length, renewals: filtered });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/renewals/:id
 * Update renewal dates or status
 */
async function updateRenewal(req, res, next) {
  try {
    const { id } = req.params;
    const { issueDate, expiryDate, notes, renewalStatus } = req.body;

    const existingRenewal = await prisma.renewal.findUnique({ where: { id } });
    if (!existingRenewal) {
      return res.status(404).json({ success: false, message: 'Renewal record not found.' });
    }

    const expDate = expiryDate ? new Date(expiryDate) : existingRenewal.expiryDate;
    const calculatedStatus = renewalStatus || calculateRenewalStatus(expDate);

    const updatedRenewal = await prisma.renewal.update({
      where: { id },
      data: {
        issueDate: issueDate ? new Date(issueDate) : undefined,
        expiryDate: expDate,
        notes,
        renewalStatus: calculatedStatus
      }
    });

    await prisma.activityLog.create({
      data: {
        caseId: existingRenewal.caseId,
        userId: req.user.id,
        action: 'RENEWAL_UPDATED',
        entity: 'Renewal',
        entityId: id,
        metadata: JSON.stringify({ expiryDate: expDate, status: calculatedStatus })
      }
    });

    return res.status(200).json({ success: true, message: 'Renewal updated successfully.', renewal: updatedRenewal });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRenewals,
  updateRenewal
};
