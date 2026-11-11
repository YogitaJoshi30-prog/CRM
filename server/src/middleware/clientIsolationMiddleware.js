const prisma = require('../config/db');

/**
 * Middleware to enforce strict Client Data Isolation
 * Attaches req.clientId for CLIENT role users and prevents cross-tenant access.
 */
async function enforceClientIsolation(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (req.user.role === 'CLIENT') {
      // Find client profile linked to this user ID
      const clientProfile = await prisma.client.findUnique({
        where: { userId: req.user.id }
      });

      if (!clientProfile) {
        return res.status(403).json({
          success: false,
          message: 'Client profile not found for authenticated user account.'
        });
      }

      // Attach client ID directly from server-side database lookup
      req.clientId = clientProfile.id;
      req.clientProfile = clientProfile;
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Client isolation check failed.', error: error.message });
  }
}

/**
 * Helper function to verify if a case ID belongs to the authenticated client
 */
async function verifyCaseBelongsToClient(caseId, clientId) {
  const caseRecord = await prisma.case.findFirst({
    where: {
      id: caseId,
      clientId: clientId
    }
  });

  return Boolean(caseRecord);
}

module.exports = {
  enforceClientIsolation,
  verifyCaseBelongsToClient
};
