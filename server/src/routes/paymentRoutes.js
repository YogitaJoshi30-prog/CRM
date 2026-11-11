const express = require('express');
const router = express.Router();
const { getCasePayments, recordPayment, getAllPayments } = require('../controllers/paymentController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { enforceClientIsolation } = require('../middleware/clientIsolationMiddleware');

router.use(authenticate);
router.use(enforceClientIsolation);

router.get('/cases/:id/payments', getCasePayments);
router.post('/cases/:id/payments', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), recordPayment);
router.get('/payments', getAllPayments);

module.exports = router;
