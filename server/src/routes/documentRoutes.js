const express = require('express');
const router = express.Router();
const { getCaseDocuments, uploadCaseDocument, reviewDocument, downloadDocument } = require('../controllers/documentController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { enforceClientIsolation } = require('../middleware/clientIsolationMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticate);
router.use(enforceClientIsolation);

router.get('/cases/:id/documents', getCaseDocuments);
router.post('/cases/:id/documents', upload.single('document'), uploadCaseDocument);
router.put('/documents/:id/review', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), reviewDocument);
router.get('/documents/:id/download', downloadDocument);

module.exports = router;
