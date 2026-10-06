const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');

router.post('/request', sosController.createSosRequest);
router.get('/status/:requestId', sosController.getSosStatus);

module.exports = router;
