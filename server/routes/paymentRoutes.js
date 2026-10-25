const express = require('express');
const router = express.Router();
const { getPaymentConfig, verifyPayment, retryPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// The Stripe webhook is mounted separately in server.js because it needs the raw request body.
router.get('/config', getPaymentConfig);
router.get('/verify/:orderId', protect, verifyPayment);
router.post('/retry/:orderId', protect, retryPayment);

module.exports = router;
