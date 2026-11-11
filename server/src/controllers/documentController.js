const path = require('path');
const fs = require('fs');
const prisma = require('../config/db');

/**
 * GET /api/cases/:id/documents
 */
async function getCaseDocuments(req, res, next) {
  try {
    const { id } = req.params;

    const caseRecord = await prisma.case.findUnique({ where: { id } });
    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    // Client isolation check
    if (req.user.role === 'CLIENT' && caseRecord.clientId !== req.clientId) {
      return res.status(403).json({ success: false, message: 'Access denied to this case documents.' });
    }

    const documents = await prisma.caseDocument.findMany({
      where: { caseId: id },
      include: {
        checklistItem: true,
        uploadedBy: { select: { id: true, name: true, role: true } },
        reviewedBy: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, count: documents.length, documents });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cases/:id/documents
 * Upload document for a case (Client or Staff)
 */
async function uploadCaseDocument(req, res, next) {
  try {
    const { id } = req.params;
    const { checklistItemId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a document file.' });
    }

    const caseRecord = await prisma.case.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    // Client isolation check
    if (req.user.role === 'CLIENT' && caseRecord.clientId !== req.clientId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    let docRecord;

    // If checklistItemId is provided, check if a pending CaseDocument entry exists
    if (checklistItemId) {
      const existingDoc = await prisma.caseDocument.findFirst({
        where: { caseId: id, checklistItemId }
      });

      if (existingDoc) {
        docRecord = await prisma.caseDocument.update({
          where: { id: existingDoc.id },
          data: {
            fileName: req.file.filename,
            originalName: req.file.originalname,
            storagePath: req.file.path,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            status: 'UPLOADED',
            uploadedById: req.user.id,
            uploadedAt: new Date(),
            reviewedById: null,
            reviewedAt: null,
            reviewComment: null
          }
        });
      }
    }

    if (!docRecord) {
      docRecord = await prisma.caseDocument.create({
        data: {
          caseId: id,
          checklistItemId: checklistItemId || null,
          fileName: req.file.filename,
          originalName: req.file.originalname,
          storagePath: req.file.path,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          status: 'UPLOADED',
          uploadedById: req.user.id,
          uploadedAt: new Date()
        }
      });
    }

    // Update case status if it was DOCUMENTS_PENDING
    if (caseRecord.status === 'DOCUMENTS_PENDING') {
      await prisma.case.update({
        where: { id: caseRecord.id },
        data: { status: 'DOCUMENTS_RECEIVED' }
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        caseId: id,
        userId: req.user.id,
        action: 'DOCUMENT_UPLOADED',
        entity: 'CaseDocument',
        entityId: docRecord.id,
        metadata: JSON.stringify({ fileName: docRecord.originalName })
      }
    });

    // Send notification to staff assigned
    if (req.user.role === 'CLIENT' && caseRecord.assignedStaffId) {
      await prisma.notification.create({
        data: {
          userId: caseRecord.assignedStaffId,
          title: 'New Document Uploaded',
          message: `${caseRecord.client.companyName} uploaded document: ${docRecord.originalName} for ${caseRecord.caseNumber}`,
          linkUrl: `/cases/${caseRecord.id}`
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: docRecord
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/documents/:id/review
 * Staff/Admin document review: APPROVE or REJECT (with mandatory rejection reason)
 */
async function reviewDocument(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be either APPROVED or REJECTED.' });
    }

    // MANDATORY REJECTION REASON CHECK
    if (status === 'REJECTED' && (!reviewComment || !reviewComment.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory when rejecting a document.'
      });
    }

    const doc = await prisma.caseDocument.findUnique({
      where: { id },
      include: { case: { include: { client: true } } }
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document record not found.' });
    }

    const updatedDoc = await prisma.caseDocument.update({
      where: { id },
      data: {
        status,
        reviewedById: req.user.id,
        reviewedAt: new Date(),
        reviewComment: reviewComment ? reviewComment.trim() : null
      }
    });

    // Record activity log
    const action = status === 'APPROVED' ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED';
    await prisma.activityLog.create({
      data: {
        caseId: doc.caseId,
        userId: req.user.id,
        action,
        entity: 'CaseDocument',
        entityId: doc.id,
        metadata: JSON.stringify({ fileName: doc.originalName, comment: reviewComment })
      }
    });

    // Send notification to Client if client user account exists
    if (doc.case.client.userId) {
      await prisma.notification.create({
        data: {
          userId: doc.case.client.userId,
          title: status === 'APPROVED' ? 'Document Approved' : 'Document Requires Resubmission',
          message: status === 'APPROVED' 
            ? `Your document "${doc.originalName}" for ${doc.case.caseNumber} was approved.`
            : `Your document "${doc.originalName}" was rejected: ${reviewComment}`,
          linkUrl: `/client/cases`
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Document status updated to ${status}.`,
      document: updatedDoc
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents/:id/download
 * Secure document download with path traversal prevention & client isolation
 */
async function downloadDocument(req, res, next) {
  try {
    const { id } = req.params;

    const doc = await prisma.caseDocument.findUnique({
      where: { id },
      include: { case: true }
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document record not found.' });
    }

    // Client isolation check
    if (req.user.role === 'CLIENT' && doc.case.clientId !== req.clientId) {
      return res.status(403).json({ success: false, message: 'Access denied. You cannot download other clients files.' });
    }

    if (!doc.storagePath || !fs.existsSync(doc.storagePath)) {
      return res.status(404).json({ success: false, message: 'Document file not found on storage server.' });
    }

    return res.download(doc.storagePath, doc.originalName || doc.fileName);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCaseDocuments,
  uploadCaseDocument,
  reviewDocument,
  downloadDocument
};
