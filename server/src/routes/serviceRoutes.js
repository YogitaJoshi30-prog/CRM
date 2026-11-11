const express = require('express');
const router = express.Router();
const { getServices, getServiceById, createService, updateService, addChecklistItem } = require('../controllers/serviceController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createService);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateService);
router.post('/:id/checklist', authorizeRoles('ADMIN', 'MANAGER'), addChecklistItem);

module.exports = router;
