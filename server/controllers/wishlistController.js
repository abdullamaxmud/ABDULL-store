const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug price discountPrice images stock rating numReviews brand isActive',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({
      success: true,
      data: wishlist.products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle product in wishlist (Add if not present, remove if present)
 * @route   POST /api/wishlist/toggle
 * @access  Private
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error('Valid product ID is required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      const existsIndex = wishlist.products.findIndex(
        (id) => id.toString() === productId
      );

      if (existsIndex > -1) {
        wishlist.products.splice(existsIndex, 1);
      } else {
        wishlist.products.push(productId);
      }

      await wishlist.save();
    }

    const updated = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name slug price discountPrice images stock rating numReviews brand',
    });

    res.status(200).json({
      success: true,
      message: 'Wishlist updated',
      data: updated.products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};
