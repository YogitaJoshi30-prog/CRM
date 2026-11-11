const prisma = require('../config/db');

/**
 * GET /api/cases
 */
async function getCases(req, res, next) {
  try {
    const { status, priority, serviceId, search } = req.query;

    const where = {};

    // Strict Client Data Isolation
    if (req.user.role === 'CLIENT') {
      where.clientId = req.clientId;
    } else {
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (serviceId) where.serviceId = serviceId;
      if (search) {
        where.OR = [
          { caseNumber: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { client: { companyName: { contains: search, mode: 'insensitive' } } }
        ];
      }
    }

    const cases = await prisma.case.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true, contactPerson: true, email: true } },
        service: { select: { id: true, name: true, category: true } },
        assignedStaff: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { documents: true, payments: true, comments: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.status(200).json({ success: true, count: cases.length, cases });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/cases/:id
 */
async function getCaseById(req, res, next) {
  try {
    const { id } = req.params;

    const caseRecord = await prisma.case.findUnique({
      where: { id },
      include: {
        client: true,
        service: { include: { checklistItems: true } },
        assignedStaff: { select: { id: true, name: true, email: true, phone: true } },
        manager: { select: { id: true, name: true, email: true } },
        documents: {
          include: {
            checklistItem: true,
            uploadedBy: { select: { id: true, name: true, role: true } },
            reviewedBy: { select: { id: true, name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          include: {
            recordedBy: { select: { id: true, name: true } }
          },
          orderBy: { paymentDate: 'desc' }
        },
        comments: {
          include: {
            author: { select: { id: true, name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          include: {
            user: { select: { id: true, name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        renewals: {
          orderBy: { expiryDate: 'desc' }
        }
      }
    });

    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    // Strict Client Data Isolation
    if (req.user.role === 'CLIENT' && caseRecord.clientId !== req.clientId) {
      return res.status(403).json({ success: false, message: 'Access denied. You do not own this case.' });
    }

    // Filter comments for client role (hide INTERNAL notes)
    if (req.user.role === 'CLIENT') {
      caseRecord.comments = caseRecord.comments.filter(c => c.visibility === 'CLIENT_VISIBLE');
    }

    return res.status(200).json({ success: true, case: caseRecord });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cases
 * Create case & auto-generate document checklist items
 */
async function createCase(req, res, next) {
  try {
    const { clientId, serviceId, title, description, assignedStaffId, managerId, priority, targetCompletionDate, totalFee } = req.body;

    if (!clientId || !serviceId || !title) {
      return res.status(400).json({ success: false, message: 'Client, Service, and Title are required.' });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { checklistItems: true }
    });

    if (!service) {
      return res.status(400).json({ success: false, message: 'Invalid service selected.' });
    }

    // Auto-generate Case Number
    const caseCount = await prisma.case.count();
    const caseNumber = `CASE-2026-${String(caseCount + 1).padStart(3, '0')}`;

    const feeAmount = totalFee !== undefined ? Number(totalFee) : Number(service.defaultFee);

    // Calculate initial renewal date based on service renewalPeriodMonths
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + (service.renewalPeriodMonths || 12));

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Case record
      const newCase = await tx.case.create({
        data: {
          caseNumber,
          clientId,
          serviceId,
          title,
          description,
          assignedStaffId,
          managerId: managerId || req.user.id,
          priority: priority || 'MEDIUM',
          status: 'DOCUMENTS_PENDING',
          startDate: new Date(),
          targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null,
          totalFee: feeAmount,
          amountPaid: 0.00,
          outstandingAmount: feeAmount,
          renewalDate
        }
      });

      // 2. Auto-generate CaseDocument records for each checklist template item
      if (service.checklistItems && service.checklistItems.length > 0) {
        for (const item of service.checklistItems) {
          await tx.caseDocument.create({
            data: {
              caseId: newCase.id,
              checklistItemId: item.id,
              fileName: '',
              originalName: item.name,
              storagePath: '',
              mimeType: '',
              fileSize: 0,
              status: 'PENDING'
            }
          });
        }
      }

      // 3. Create default Renewal record
      await tx.renewal.create({
        data: {
          caseId: newCase.id,
          serviceId: service.id,
          issueDate: new Date(),
          expiryDate: renewalDate,
          renewalStatus: 'ACTIVE',
          reminderDate: new Date(renewalDate.getTime() - 30 * 86400000) // 30 days before
        }
      });

      // 4. Log Activity
      await tx.activityLog.create({
        data: {
          caseId: newCase.id,
          userId: req.user.id,
          action: 'CASE_CREATED',
          entity: 'Case',
          entityId: newCase.id,
          metadata: JSON.stringify({ caseNumber, title: newCase.title, fee: feeAmount })
        }
      });

      return newCase;
    });

    return res.status(201).json({
      success: true,
      message: `Case ${caseNumber} created successfully with document checklist!`,
      case: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/cases/:id
 */
async function updateCase(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, assignedStaffId, managerId, status, priority, targetCompletionDate, totalFee } = req.body;

    const existingCase = await prisma.case.findUnique({ where: { id } });
    if (!existingCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    const newFee = totalFee !== undefined ? Number(totalFee) : Number(existingCase.totalFee);
    const newOutstanding = newFee - Number(existingCase.amountPaid);

    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        title,
        description,
        assignedStaffId,
        managerId,
        status,
        priority,
        targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : undefined,
        totalFee: newFee,
        outstandingAmount: newOutstanding
      }
    });

    // Record activity log if status changed
    if (status && status !== existingCase.status) {
      await prisma.activityLog.create({
        data: {
          caseId: id,
          userId: req.user.id,
          action: 'CASE_STATUS_CHANGED',
          entity: 'Case',
          entityId: id,
          metadata: JSON.stringify({ from: existingCase.status, to: status })
        }
      });
    }

    return res.status(200).json({ success: true, message: 'Case updated successfully.', case: updatedCase });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cases/:id
 */
async function deleteCase(req, res, next) {
  try {
    const { id } = req.params;

    const existingCase = await prisma.case.findUnique({ where: { id } });
    if (!existingCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    await prisma.case.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Case deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase
};
