const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), getAuditLogs);

module.exports = router;
