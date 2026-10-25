const express = require('express');
const router = express.Router();
const {
  getCategories,
  getAllCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCategories)
  .post(protect, adminOnly, createCategory);

// Admin-only views (declared before /:id so "admin" is not read as an ID)
router.get('/admin/all', protect, adminOnly, getAllCategoriesAdmin);
router.put('/admin/reorder', protect, adminOnly, reorderCategories);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, adminOnly, updateCategory)
  .delete(protect, adminOnly, deleteCategory);

module.exports = router;
