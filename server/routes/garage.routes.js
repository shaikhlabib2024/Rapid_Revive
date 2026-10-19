const express = require('express');
const router = express.Router();
const garageController = require('../controllers/garage.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/verified', garageController.getAllVerifiedGarages);
router.post('/toggle-status', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.toggleOnlineStatus);
router.get('/requests/:garageId', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.getIncomingRequests);
router.post('/update-job', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.updateJobStatus);
router.post('/update-location', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.updateGarageLocation);

module.exports = router;
