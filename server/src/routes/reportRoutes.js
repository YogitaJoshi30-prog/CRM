const express = require('express');
const router = express.Router();
const { getPerformanceReport, exportCsv } = require('../controllers/reportController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/performance', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), getPerformanceReport);
router.get('/export-csv', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), exportCsv);

module.exports = router;
