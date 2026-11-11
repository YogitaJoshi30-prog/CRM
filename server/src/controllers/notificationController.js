const prisma = require('../config/db');

/**
 * GET /api/notifications
 */
async function getUserNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    return res.status(200).json({ success: true, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/notifications/:id/read
 */
async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { isRead: true }
    });

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/notifications/read-all
 */
async function markAllAsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
