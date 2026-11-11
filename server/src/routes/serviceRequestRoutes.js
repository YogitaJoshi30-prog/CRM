const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  convertServiceRequestToCase
} = require('../controllers/serviceRequestController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { enforceClientIsolation } = require('../middleware/clientIsolationMiddleware');

router.use(authenticate);
router.use(enforceClientIsolation);

router.get('/', getServiceRequests);
router.post('/', createServiceRequest);
router.get('/:id', getServiceRequestById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), updateServiceRequest);
router.post('/:id/convert', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), convertServiceRequestToCase);

module.exports = router;
