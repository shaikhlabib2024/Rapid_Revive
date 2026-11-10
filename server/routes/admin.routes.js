const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/verifications', verifyToken, authorizeRoles('admin'), adminController.getPendingVerifications);
router.post('/verify-garage', verifyToken, authorizeRoles('admin'), adminController.verifyGarage);
router.get('/stats', verifyToken, authorizeRoles('admin'), adminController.getSystemStats);
router.get('/dispatches', verifyToken, authorizeRoles('admin'), adminController.getLiveDispatches);
router.get('/directory', verifyToken, authorizeRoles('admin'), adminController.getDirectory);
router.post('/user-status', verifyToken, authorizeRoles('admin'), adminController.updateUserStatus);
router.get('/settings', verifyToken, authorizeRoles('admin'), adminController.getSettings);
router.post('/settings', verifyToken, authorizeRoles('admin'), adminController.updateSettings);

module.exports = router;
