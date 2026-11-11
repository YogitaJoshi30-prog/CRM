const express = require('express');
const router = express.Router();
const { getCases, getCaseById, createCase, updateCase, deleteCase } = require('../controllers/caseController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { enforceClientIsolation } = require('../middleware/clientIsolationMiddleware');

router.use(authenticate);
router.use(enforceClientIsolation);

router.get('/', getCases);
router.get('/:id', getCaseById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), createCase);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), updateCase);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteCase);

module.exports = router;
