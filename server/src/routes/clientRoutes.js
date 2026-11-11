const express = require('express');
const router = express.Router();
const { getClients, getClientById, createClient, updateClient } = require('../controllers/clientController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { enforceClientIsolation } = require('../middleware/clientIsolationMiddleware');

router.use(authenticate);
router.use(enforceClientIsolation);

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), createClient);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'STAFF'), updateClient);

module.exports = router;
