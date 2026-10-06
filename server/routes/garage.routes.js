const express = require('express');
const router = express.Router();
const garageController = require('../controllers/garage.controller');

router.post('/toggle-status', garageController.toggleOnlineStatus);
router.get('/requests/:garageId', garageController.getIncomingRequests);
router.post('/update-job', garageController.updateJobStatus);

module.exports = router;
