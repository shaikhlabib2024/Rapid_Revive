const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/verifications', verifyToken, authorizeRoles('admin'), adminController.getPendingVerifications);
router.post('/verify-garage', verifyToken, authorizeRoles('admin'), adminController.verifyGarage);
router.get('/stats', verifyToken, authorizeRoles('admin'), adminController.getSystemStats);

module.exports = router;
