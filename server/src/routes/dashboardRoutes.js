const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');
const { enforceClientIsolation } = require('../middleware/clientIsolationMiddleware');

router.use(authenticate);
router.use(enforceClientIsolation);

router.get('/summary', getDashboardSummary);

module.exports = router;
