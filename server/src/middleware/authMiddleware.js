const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch user from DB to ensure active status
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, clientProfile: { select: { id: true, companyName: true } } }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

/**
 * Middleware factory for Role-Based Access Control (RBAC)
 * @param {...string} allowedRoles Allowed roles (ADMIN, MANAGER, STAFF, CLIENT)
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles
};
