const express = require('express');
const router = express.Router();
const { getRenewals, updateRenewal } = require('../controllers/renewalController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { enforceClientIsolation } = require('../middleware/clientIsolationMiddleware');

router.use(authenticate);
router.use(enforceClientIsolation);

router.get('/renewals', getRenewals);
router.put('/renewals/:id', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), updateRenewal);

module.exports = router;
