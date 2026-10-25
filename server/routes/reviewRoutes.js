const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:productId')
  .get(getProductReviews)
  .post(protect, createReview);

router.route('/item/:id')
  .delete(protect, deleteReview);

module.exports = router;
