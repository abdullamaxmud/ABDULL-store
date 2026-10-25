const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getFlashDeals,
  getTrendingProducts,
  getNewArrivals,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public collection and curated endpoints
router.get('/featured', getFeaturedProducts);
router.get('/deals', getFlashDeals);
router.get('/trending', getTrendingProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/:id/related', getRelatedProducts);

// Base listing & Admin creation
router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

// Single item access, update, and removal
router.route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

module.exports = router;
