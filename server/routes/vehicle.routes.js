const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/user/:userId', vehicleController.getUserVehicles);
router.post('/', verifyToken, vehicleController.addVehicle);
router.delete('/:vehicleId', verifyToken, vehicleController.deleteVehicle);

module.exports = router;
