const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getInventory,
  getAllUsers,
  toggleUserStatus,
  updateUser,
  createUser,
  unlockUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');
const { getAnalytics, exportOrdersCsv } = require('../controllers/analyticsController');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/orders/export', exportOrdersCsv);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', validateObjectId('id'), updateOrderStatus);
router.get('/inventory', getInventory);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:id', validateObjectId('id'), deleteUser);
router.put('/users/:id/unlock', validateObjectId('id'), unlockUser);
router.put('/users/:id', validateObjectId('id'), updateUser);
router.put('/users/:id/status', validateObjectId('id'), toggleUserStatus);

module.exports = router;
