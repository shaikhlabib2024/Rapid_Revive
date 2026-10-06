const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/verifications', adminController.getPendingVerifications);
router.post('/verify-garage', adminController.verifyGarage);
router.get('/stats', adminController.getSystemStats);

module.exports = router;
