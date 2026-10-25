const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getPublicCoupons,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/public', getPublicCoupons);
router.post('/validate', protect, validateCoupon);

router.route('/')
  .get(protect, adminOnly, getCoupons)
  .post(protect, adminOnly, createCoupon);

router.route('/:id')
  .put(protect, adminOnly, updateCoupon)
  .delete(protect, adminOnly, deleteCoupon);

module.exports = router;
