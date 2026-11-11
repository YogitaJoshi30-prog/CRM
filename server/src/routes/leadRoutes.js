const express = require('express');
const router = express.Router();
const { getLeads, getLeadById, createLead, updateLead, deleteLead, convertLeadToClient } = require('../controllers/leadController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), getLeads);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), createLead);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), getLeadById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), updateLead);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), deleteLead);
router.post('/:id/convert', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), convertLeadToClient);

module.exports = router;
