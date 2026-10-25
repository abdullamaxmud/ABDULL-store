const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { orderLimiter } = require('../middleware/rateLimiter');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);

router.route('/')
  .post(orderLimiter, createOrder);

router.route('/my-orders')
  .get(getMyOrders);

router.route('/:id')
  .get(validateObjectId('id'), getOrderById);

router.route('/:id/cancel')
  .put(validateObjectId('id'), cancelOrder);

module.exports = router;
