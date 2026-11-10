const express = require('express');
const router = express.Router();
const garageController = require('../controllers/garage.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/verified', garageController.getAllVerifiedGarages);
router.get('/status/:garageId', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.getGarageStatus);
router.post('/toggle-status', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.toggleOnlineStatus);
router.get('/requests/:garageId', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.getIncomingRequests);
router.post('/update-job', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.updateJobStatus);
router.post('/update-location', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.updateGarageLocation);

// Services Menu
router.get('/services/:garageId', garageController.getGarageServices);
router.post('/services', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.addGarageService);
router.patch('/services/:serviceId', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.toggleGarageService);

// Earnings Ledger
router.get('/earnings/:garageId', verifyToken, authorizeRoles('garage_owner', 'admin'), garageController.getGarageEarnings);

module.exports = router;
