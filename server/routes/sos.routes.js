const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/pricing', sosController.getPricing);
router.get('/reverse-geocode', sosController.reverseGeocodeCoords);
router.post('/request', sosController.createSosRequest);
router.get('/active/:userId', verifyToken, sosController.getActiveSosForUser);
router.get('/status/:requestId', sosController.getSosStatus);
router.post('/cancel/:requestId', verifyToken, sosController.cancelSosRequest);

// Maintenance Bookings
router.post('/booking', verifyToken, sosController.createBookingRequest);
router.get('/bookings/:userId', verifyToken, sosController.getUserBookings);

// Driver Invoices
router.get('/invoices/:userId', verifyToken, sosController.getUserInvoices);
router.post('/invoices/:invoiceId/pay', verifyToken, sosController.payInvoice);

module.exports = router;
