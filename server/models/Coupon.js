const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide a coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [30, 'Coupon code cannot exceed 30 characters'],
      match: [/^[A-Z0-9_-]+$/, 'Coupon code may only contain letters, numbers, dashes and underscores'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [160, 'Description cannot exceed 160 characters'],
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed', 'shipping'],
      default: 'percent',
    },
    value: {
      type: Number,
      default: 0,
      min: [0, 'Discount value cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: 0, // 0 = no cap (only relevant for percent coupons)
      min: 0,
    },
    minOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.pre('validate', function (next) {
  if (this.discountType === 'percent' && this.value > 100) {
    this.invalidate('value', 'Percentage discount cannot exceed 100');
  }
  next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
