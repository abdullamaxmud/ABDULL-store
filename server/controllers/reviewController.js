const mongoose = require('mongoose');
const validator = require('validator');
const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * @desc    Get all reviews for a specific product
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error('Valid product ID is required');
    }

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a product rating & review
 * @route   POST /api/reviews/:productId
 * @access  Private
 */
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error('Valid product ID is required');
    }

    const numRating = parseInt(rating, 10);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      res.status(400);
      throw new Error('Please provide an integer star rating between 1 and 5');
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      res.status(400);
      throw new Error('Please provide a review comment');
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 3 || trimmedComment.length > 500) {
      res.status(400);
      throw new Error('Review comment must be between 3 and 500 characters');
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error('Product not found or unavailable');
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      res.status(400);
      throw new Error('You have already submitted a review for this product');
    }

    // Sanitize user comment text to prevent stored XSS
    const sanitizedComment = validator.escape(trimmedComment);

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: numRating,
      comment: sanitizedComment,
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private/Admin
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Valid review ID is required');
    }

    const review = await Review.findById(id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Must be admin or author
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Review removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
};
