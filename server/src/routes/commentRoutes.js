const express = require('express');
const router = express.Router();
const { getCaseComments, addCaseComment } = require('../controllers/commentController');
const { authenticate } = require('../middleware/authMiddleware');
const { enforceClientIsolation } = require('../middleware/clientIsolationMiddleware');

router.use(authenticate);
router.use(enforceClientIsolation);

router.get('/cases/:id/comments', getCaseComments);
router.post('/cases/:id/comments', addCaseComment);

module.exports = router;
