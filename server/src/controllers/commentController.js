const prisma = require('../config/db');

/**
 * GET /api/cases/:id/comments
 */
async function getCaseComments(req, res, next) {
  try {
    const { id } = req.params;

    const caseRecord = await prisma.case.findUnique({ where: { id } });
    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    const where = { caseId: id };

    // Strict Client Data Isolation: Clients only see CLIENT_VISIBLE comments
    if (req.user.role === 'CLIENT') {
      if (caseRecord.clientId !== req.clientId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      where.visibility = 'CLIENT_VISIBLE';
    }

    const comments = await prisma.caseComment.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, count: comments.length, comments });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cases/:id/comments
 */
async function addCaseComment(req, res, next) {
  try {
    const { id } = req.params;
    const { message, visibility } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Comment message cannot be empty.' });
    }

    const caseRecord = await prisma.case.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    // Clients can ONLY post CLIENT_VISIBLE comments
    let selectedVisibility = visibility || 'INTERNAL';
    if (req.user.role === 'CLIENT') {
      if (caseRecord.clientId !== req.clientId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      selectedVisibility = 'CLIENT_VISIBLE';
    }

    const comment = await prisma.caseComment.create({
      data: {
        caseId: id,
        authorId: req.user.id,
        message: message.trim(),
        visibility: selectedVisibility
      },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    // Record activity log
    const action = selectedVisibility === 'CLIENT_VISIBLE' ? 'CLIENT_UPDATE_ADDED' : 'INTERNAL_NOTE_ADDED';
    await prisma.activityLog.create({
      data: {
        caseId: id,
        userId: req.user.id,
        action,
        entity: 'CaseComment',
        entityId: comment.id,
        metadata: JSON.stringify({ visibility: selectedVisibility })
      }
    });

    // Notify client if staff added client-visible update
    if (selectedVisibility === 'CLIENT_VISIBLE' && req.user.role !== 'CLIENT' && caseRecord.client.userId) {
      await prisma.notification.create({
        data: {
          userId: caseRecord.client.userId,
          title: 'New Case Update',
          message: `Update on ${caseRecord.caseNumber}: ${message.slice(0, 80)}...`,
          linkUrl: '/client/cases'
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCaseComments,
  addCaseComment
};
