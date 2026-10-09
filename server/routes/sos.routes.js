const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/request', sosController.createSosRequest); // Can be triggered with or without token during emergencies
router.get('/status/:requestId', sosController.getSosStatus);

module.exports = router;
