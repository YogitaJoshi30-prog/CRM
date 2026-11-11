const prisma = require('../config/db');

/**
 * POST /api/service-requests
 * Client or Staff creates a new service request
 */
async function createServiceRequest(req, res, next) {
  try {
    const { serviceId, description, clientId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ success: false, message: 'Please select a compliance service.' });
    }

    let targetClientId;
    if (req.user.role === 'CLIENT') {
      targetClientId = req.clientId;
    } else {
      targetClientId = clientId;
      if (!targetClientId) {
        return res.status(400).json({ success: false, message: 'Client ID is required.' });
      }
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(400).json({ success: false, message: 'Invalid compliance service selected.' });
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        clientId: targetClientId,
        serviceId,
        requestedById: req.user.id,
        description: description ? description.trim() : null,
        status: 'PENDING'
      },
      include: {
        client: { select: { id: true, companyName: true, contactPerson: true, email: true } },
        service: { select: { id: true, name: true, category: true, defaultFee: true } },
        requestedBy: { select: { id: true, name: true, role: true } }
      }
    });

    // Activity Log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'SERVICE_REQUEST_CREATED',
        entity: 'ServiceRequest',
        entityId: serviceRequest.id,
        metadata: JSON.stringify({ companyName: serviceRequest.client.companyName, serviceName: service.name })
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Service request submitted successfully!',
      serviceRequest
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/service-requests
 * Get all service requests (Strictly isolated for CLIENT role)
 */
async function getServiceRequests(req, res, next) {
  try {
    const { status, search } = req.query;

    const where = {};

    // Strict Client Data Isolation
    if (req.user.role === 'CLIENT') {
      where.clientId = req.clientId;
    } else {
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { client: { companyName: { contains: search, mode: 'insensitive' } } },
          { service: { name: { contains: search, mode: 'insensitive' } } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
    }

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true, contactPerson: true, email: true } },
        service: { select: { id: true, name: true, category: true, defaultFee: true } },
        requestedBy: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, count: requests.length, serviceRequests: requests });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/service-requests/:id
 */
async function getServiceRequestById(req, res, next) {
  try {
    const { id } = req.params;

    const requestRecord = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        client: true,
        service: { include: { checklistItems: true } },
        requestedBy: { select: { id: true, name: true, role: true, email: true } }
      }
    });

    if (!requestRecord) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    // Strict Client Data Isolation
    if (req.user.role === 'CLIENT' && requestRecord.clientId !== req.clientId) {
      return res.status(403).json({ success: false, message: 'Access denied to other clients service requests.' });
    }

    return res.status(200).json({ success: true, serviceRequest: requestRecord });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/service-requests/:id
 * Staff/Manager updates request status or notes
 */
async function updateServiceRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const existingRequest = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existingRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: status || existingRequest.status,
        notes: notes !== undefined ? notes : existingRequest.notes
      },
      include: {
        client: { select: { id: true, companyName: true, contactPerson: true } },
        service: { select: { id: true, name: true } }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'SERVICE_REQUEST_UPDATED',
        entity: 'ServiceRequest',
        entityId: id,
        metadata: JSON.stringify({ status: updatedRequest.status })
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Service request updated successfully.',
      serviceRequest: updatedRequest
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/service-requests/:id/convert
 * Convert Service Request -> Compliance Case (Staff/Manager/Admin)
 */
async function convertServiceRequestToCase(req, res, next) {
  try {
    const { id } = req.params;
    const { title, priority, totalFee, assignedStaffId, targetCompletionDate, description } = req.body;

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        client: true,
        service: { include: { checklistItems: true } }
      }
    });

    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    if (serviceRequest.status === 'CONVERTED' || serviceRequest.createdCaseId) {
      return res.status(400).json({ success: false, message: 'This service request has already been converted to a Case.' });
    }

    const caseCount = await prisma.case.count();
    const caseNumber = `CASE-2026-${String(caseCount + 1).padStart(3, '0')}`;
    const feeAmount = totalFee !== undefined && totalFee !== '' ? Number(totalFee) : Number(serviceRequest.service.defaultFee);

    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + (serviceRequest.service.renewalPeriodMonths || 12));

    const caseTitle = title ? title.trim() : `${serviceRequest.service.name} - ${serviceRequest.client.companyName}`;
    const caseDescription = description || serviceRequest.description;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Case
      const newCase = await tx.case.create({
        data: {
          caseNumber,
          clientId: serviceRequest.clientId,
          serviceId: serviceRequest.serviceId,
          title: caseTitle,
          description: caseDescription,
          assignedStaffId: assignedStaffId || null,
          managerId: req.user.id,
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

      // 2. Auto-generate CaseDocument records for checklist
      if (serviceRequest.service.checklistItems && serviceRequest.service.checklistItems.length > 0) {
        for (const item of serviceRequest.service.checklistItems) {
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
          serviceId: serviceRequest.serviceId,
          issueDate: new Date(),
          expiryDate: renewalDate,
          renewalStatus: 'ACTIVE',
          reminderDate: new Date(renewalDate.getTime() - 30 * 86400000)
        }
      });

      // 4. Update ServiceRequest status to CONVERTED
      const updatedRequest = await tx.serviceRequest.update({
        where: { id: serviceRequest.id },
        data: {
          status: 'CONVERTED',
          createdCaseId: newCase.id
        }
      });

      // 5. Activity Log
      await tx.activityLog.create({
        data: {
          caseId: newCase.id,
          userId: req.user.id,
          action: 'SERVICE_REQUEST_CONVERTED',
          entity: 'ServiceRequest',
          entityId: serviceRequest.id,
          metadata: JSON.stringify({ caseNumber, clientId: serviceRequest.clientId, serviceName: serviceRequest.service.name })
        }
      });

      // 6. Notify Client if user account exists
      if (serviceRequest.client.userId) {
        await tx.notification.create({
          data: {
            userId: serviceRequest.client.userId,
            title: 'Service Request Approved!',
            message: `Your request for "${serviceRequest.service.name}" has been approved. Case ${caseNumber} is now active under My Cases.`,
            linkUrl: `/client/cases/${newCase.id}`
          }
        });
      }

      return { case: newCase, serviceRequest: updatedRequest };
    });

    return res.status(201).json({
      success: true,
      message: `Service request converted to Case ${caseNumber} with auto-generated document checklist!`,
      case: result.case,
      serviceRequest: result.serviceRequest
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  convertServiceRequestToCase
};
