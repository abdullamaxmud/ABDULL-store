const mongoose = require('mongoose');
const validator = require('validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const { cancelOrderAndRestore } = require('../utils/orderLifecycle');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

// The original seeded administrator can never be demoted, deactivated or deleted
const MASTER_ADMIN_EMAIL = 'admin@abdull.com';

/** Refuse changes that would leave the store with no active administrator. */
const ensureAnotherAdminRemains = async (user, res) => {
  if (user.role !== 'admin') return;
  const otherAdmins = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: user._id } });
  if (otherAdmins === 0) {
    res.status(400);
    throw new Error('This is the last active administrator. Make another account an admin first.');
  }
};

/**
 * @desc    Get aggregate metrics and counters for admin dashboard
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });

    // Aggregate total revenue for non-cancelled orders
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? Math.round(revenueAgg[0].total * 100) / 100 : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent customers
    const recentUsers = await User.find({ role: 'customer' })
      .select('-password -loginAttempts -lockUntil')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
        recentOrders,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get periodic sales analytics and category breakdown
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
const getSalesAnalytics = async (req, res, next) => {
  try {
    // 7-day revenue grouping
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          orderStatus: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top 5 selling products
    const topProducts = await Product.find({ isActive: true })
      .select('name price soldCount stock images')
      .sort({ soldCount: -1 })
      .limit(5);

    // Categories breakdown
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          name: '$categoryInfo.name',
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyRevenue,
        topProducts,
        categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders with pagination and filtering
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const rawPage = parseInt(req.query.page, 10);
    const rawLimit = parseInt(req.query.limit, 10);
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 15;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'All') {
      const allowed = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
      if (allowed.includes(req.query.status)) {
        query.orderStatus = req.query.status;
      }
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order lifecycle status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid order ID format');
    }

    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const allowedOrderStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const allowedPaymentStatuses = ['Pending', 'Paid', 'Failed'];

    if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      // Same path as a customer cancel: restore stock, return promo use, refund card payments
      try {
        await cancelOrderAndRestore(order, { reason: 'requested_by_customer' });
      } catch (cancelError) {
        res.status(cancelError.statusCode || 502);
        throw cancelError;
      }
      return res.status(200).json({
        success: true,
        message: order.paymentStatus === 'Refunded' ? 'Order cancelled and card payment refunded' : 'Order cancelled and stock restored',
        data: order,
      });
    }

    if (order.orderStatus === 'Cancelled' && orderStatus && orderStatus !== 'Cancelled') {
      res.status(400);
      throw new Error('A cancelled order cannot be reopened. Ask the customer to place a new order.');
    }

    if (orderStatus) {
      if (!allowedOrderStatuses.includes(orderStatus)) {
        res.status(400);
        throw new Error(`Invalid order status "${orderStatus}"`);
      }
      order.orderStatus = orderStatus;
      if (orderStatus === 'Delivered') {
        order.deliveredAt = Date.now();
        // Cash is collected on delivery; card orders are already paid via Stripe
        if (order.paymentMethod === 'Cash on Delivery') order.paymentStatus = 'Paid';
      }
    }

    if (paymentStatus) {
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        res.status(400);
        throw new Error(`Invalid payment status "${paymentStatus}"`);
      }
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get real-time inventory tracking overview
 * @route   GET /api/admin/inventory
 * @access  Private/Admin
 */
const getInventory = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .select('name sku price stock soldCount images category')
      .sort({ stock: 1 });

    const formattedInventory = products.map((item) => {
      let status = 'In Stock';
      if (item.stock === 0) status = 'Out of Stock';
      else if (item.stock <= 5) status = 'Low Stock';

      return {
        _id: item._id,
        name: item.name,
        sku: item.sku,
        category: item.category?.name || 'Uncategorized',
        price: item.price,
        stock: item.stock,
        soldCount: item.soldCount,
        image: item.images[0] || '',
        status,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedInventory.length,
      data: formattedInventory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users list
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const [users, stats] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).lean(),
      Order.aggregate([
        { $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: { $cond: [{ $ne: ['$orderStatus', 'Cancelled'] }, '$totalPrice', 0] } },
          lastOrderAt: { $max: '$createdAt' },
        } },
      ]),
    ]);
    const statsById = new Map(stats.map((s) => [String(s._id), s]));

    const data = users.map(({ loginAttempts, lockUntil, ...u }) => {
      const st = statsById.get(String(u._id));
      return {
        ...u,
        isLocked: !!(lockUntil && new Date(lockUntil) > new Date()),
        failedLogins: loginAttempts || 0,
        orderCount: st?.orderCount || 0,
        totalSpent: Math.round((st?.totalSpent || 0) * 100) / 100,
        lastOrderAt: st?.lastOrderAt || null,
        isMasterAdmin: u.email === MASTER_ADMIN_EMAIL,
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user active/deactivated status
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid user ID format');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Protect master admin and preventing admin from deactivating themselves
    if (user.email === MASTER_ADMIN_EMAIL) {
      res.status(400);
      throw new Error('Master administrator account cannot be deactivated');
    }

    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot deactivate your own administrative account');
    }

    if (user.isActive) await ensureAnotherAdminRemains(user, res);
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Update user details (name, email, phone, role, password)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid user ID format');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { name, email, phone, role, password } = req.body;

    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim().slice(0, 60);
    }

    if (email && typeof email === 'string' && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (!validator.isEmail(cleanEmail)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
      }
      if (cleanEmail !== user.email) {
        const emailExists = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
        if (emailExists) {
          res.status(400);
          throw new Error('This email address is already taken by another account');
        }
        user.email = cleanEmail;
      }
    }

    if (phone !== undefined && typeof phone === 'string') {
      user.phone = phone.trim().slice(0, 30);
    }

    if (role && ['customer', 'admin'].includes(role) && role !== user.role) {
      if (role === 'customer') {
        if (user.email === MASTER_ADMIN_EMAIL) {
          res.status(400);
          throw new Error('The master administrator cannot be changed to a customer');
        }
        if (user._id.toString() === req.user._id.toString()) {
          res.status(400);
          throw new Error('You cannot remove your own admin access. Ask another admin to do it.');
        }
        await ensureAnotherAdminRemains(user, res);
      }
      user.role = role;
    }

    if (password && typeof password === 'string' && password.trim()) {
      if (password.length < 8 || password.length > 128) {
        res.status(400);
        throw new Error('Password must be between 8 and 128 characters long');
      }
      user.password = password;
      // A new password also lifts any lockout from failed sign-in attempts
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    const updated = await user.save();

    res.status(200).json({
      success: true,
      message: `Account for "${updated.name}" updated successfully`,
      data: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: create a customer or admin account
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400);
      throw new Error('Please provide a name');
    }
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!validator.isEmail(cleanEmail)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      res.status(400);
      throw new Error('Password must be between 8 and 128 characters long');
    }
    if (await User.exists({ email: cleanEmail })) {
      res.status(400);
      throw new Error('An account with this email already exists');
    }

    const user = await User.create({
      name: name.trim().slice(0, 60),
      email: cleanEmail,
      password,
      phone: typeof phone === 'string' ? phone.trim().slice(0, 30) : '',
      role: role === 'admin' ? 'admin' : 'customer',
    });

    res.status(201).json({
      success: true,
      message: `${user.role === 'admin' ? 'Admin' : 'Customer'} account created for ${user.email}`,
      data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isActive: user.isActive, createdAt: user.createdAt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: clear a sign-in lockout caused by failed attempts
 * @route   PUT /api/admin/users/:id/unlock
 * @access  Private/Admin
 */
const unlockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } },
      { new: true }
    );
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.status(200).json({ success: true, message: `Sign-in unlocked for ${user.email}` });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: permanently delete an account. Their past orders are kept for
 *          the store's records (they still hold the delivery details); the
 *          account, bag and wishlist are removed.
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    if (user.email === MASTER_ADMIN_EMAIL) {
      res.status(400);
      throw new Error('The master administrator account cannot be deleted');
    }
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own account');
    }
    await ensureAnotherAdminRemains(user, res);

    await Promise.all([Cart.deleteMany({ user: user._id }), Wishlist.deleteMany({ user: user._id })]);
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ success: true, message: `Account ${user.email} deleted` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getSalesAnalytics,
  getAllOrders,
  updateOrderStatus,
  getInventory,
  getAllUsers,
  toggleUserStatus,
  updateUser,
  createUser,
  unlockUser,
  deleteUser,
};
