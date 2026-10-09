const express = require('express');
const router = express.Router();
const garageController = require('../controllers/garage.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/toggle-status', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.toggleOnlineStatus);
router.get('/requests/:garageId', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.getIncomingRequests);
router.post('/update-job', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.updateJobStatus);

module.exports = router;
