const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCart);

router.route('/items')
  .post(addToCart);

router.route('/items/:itemId')
  .put(updateCartItemQuantity)
  .delete(removeFromCart);

router.route('/clear')
  .delete(clearCart);

module.exports = router;
