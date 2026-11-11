const prisma = require('../config/db');

/**
 * GET /api/audit-logs
 */
async function getAuditLogs(req, res, next) {
  try {
    const { action, entity } = req.query;

    const where = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        case: { select: { id: true, caseNumber: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAuditLogs
};
