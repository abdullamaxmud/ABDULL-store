const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// Shipping rule (free from a threshold, else a flat fee) lives in Site Settings so the
// cart, coupon preview and order totals always agree with what the admin configured.
const { calculateShipping } = require('../utils/siteSettings');

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Validate a coupon code against a subtotal and user, and compute its effect.
 * Throws an Error with `statusCode` set when the coupon cannot be applied.
 * @returns {{ coupon, discount, shippingPrice, freeShipping }}
 */
const evaluateCoupon = async (rawCode, subtotal, userId) => {
  const fail = (message, statusCode = 400) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    throw err;
  };

  if (typeof rawCode !== 'string' || !rawCode.trim()) {
    fail('Please enter a promo code');
  }

  const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30);
  const coupon = await Coupon.findOne({ code });

  if (!coupon || !coupon.isActive) {
    fail(`Promo code "${code}" is not valid`, 404);
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    fail(`Promo code "${code}" has expired`);
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    fail(`Promo code "${code}" has reached its usage limit`);
  }

  if (subtotal < coupon.minOrder) {
    fail(`Add $${round2(coupon.minOrder - subtotal).toFixed(2)} more to use "${code}" (minimum order $${coupon.minOrder})`);
  }

  if (coupon.firstOrderOnly && userId) {
    const previousOrders = await Order.countDocuments({ user: userId, orderStatus: { $ne: 'Cancelled' } });
    if (previousOrders > 0) {
      fail(`"${code}" is only valid on your first order`);
    }
  }

  let discount = 0;
  let shippingPrice = await calculateShipping(subtotal);

  if (coupon.discountType === 'percent') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.discountType === 'fixed') {
    discount = Math.min(coupon.value, subtotal);
  } else if (coupon.discountType === 'shipping') {
    shippingPrice = 0;
  }

  return {
    coupon,
    discount: round2(discount),
    shippingPrice,
    freeShipping: shippingPrice === 0,
  };
};

/**
 * @desc    Preview a promo code against the current cart subtotal
 * @route   POST /api/coupons/validate
 * @access  Private
 */
const validateCoupon = async (req, res, next) => {
  try {
    const subtotal = Number(req.body.subtotal);
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      res.status(400);
      throw new Error('Invalid cart subtotal');
    }

    const result = await evaluateCoupon(req.body.code, subtotal, req.user._id);

    res.status(200).json({
      success: true,
      message: `Promo code "${result.coupon.code}" applied`,
      data: {
        code: result.coupon.code,
        description: result.coupon.description,
        discountType: result.coupon.discountType,
        discount: result.discount,
        shippingPrice: result.shippingPrice,
        total: round2(subtotal - result.discount + result.shippingPrice),
      },
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * @desc    List publicly advertised promo codes (active, unexpired)
 * @route   GET /api/coupons/public
 * @access  Public
 */
const getPublicCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    })
      .select('code description discountType value minOrder firstOrderOnly expiresAt')
      .sort({ minOrder: 1 });

    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all coupons
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    next(error);
  }
};

const pickCouponFields = (body) => {
  const fields = {};
  const allowed = ['code', 'description', 'discountType', 'value', 'maxDiscount', 'minOrder', 'usageLimit', 'firstOrderOnly', 'expiresAt', 'isActive'];
  for (const key of allowed) {
    if (body[key] !== undefined) fields[key] = body[key];
  }
  if (fields.expiresAt === '') fields.expiresAt = null;
  return fields;
};

/**
 * @desc    Create coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(pickCouponFields(req.body));
    res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update coupon
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
const updateCoupon = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid coupon ID format');
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }

    Object.assign(coupon, pickCouponFields(req.body));
    await coupon.save();

    res.status(200).json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
const deleteCoupon = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid coupon ID format');
    }

    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }

    res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateShipping,
  evaluateCoupon,
  validateCoupon,
  getPublicCoupons,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
