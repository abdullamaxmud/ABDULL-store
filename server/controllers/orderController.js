const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const { calculateShipping, evaluateCoupon } = require('./couponController');
const { createCheckoutSession, releaseStaleUnpaidOrders } = require('./paymentController');
const { cancelOrderAndRestore } = require('../utils/orderLifecycle');
const { getStripe } = require('../config/stripe');

/**
 * @desc    Create new order & decrement product inventory atomically
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod = 'Cash on Delivery', couponCode } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    if (
      !shippingAddress ||
      typeof shippingAddress.fullName !== 'string' ||
      !shippingAddress.fullName.trim() ||
      typeof shippingAddress.address !== 'string' ||
      !shippingAddress.address.trim() ||
      typeof shippingAddress.city !== 'string' ||
      !shippingAddress.city.trim() ||
      typeof shippingAddress.phone !== 'string' ||
      !shippingAddress.phone.trim()
    ) {
      res.status(400);
      throw new Error('Please provide complete and valid shipping details (fullName, address, city, phone)');
    }

    const cleanShipping = {
      fullName: shippingAddress.fullName.trim().slice(0, 100),
      address: shippingAddress.address.trim().slice(0, 150),
      city: shippingAddress.city.trim().slice(0, 60),
      country: typeof shippingAddress.country === 'string' ? shippingAddress.country.trim().slice(0, 60) : 'United States',
      phone: shippingAddress.phone.trim().slice(0, 30),
      email: typeof shippingAddress.email === 'string' ? shippingAddress.email.trim().slice(0, 100) : req.user.email,
      notes: typeof shippingAddress.notes === 'string' ? shippingAddress.notes.trim().slice(0, 250) : '',
    };

    // Only methods that are actually wired up. Never mark an order paid
    // without a confirmed payment from the provider.
    const allowedPaymentMethods = ['Cash on Delivery', 'Credit Card'];
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      res.status(400);
      throw new Error(`Payment method "${paymentMethod}" is not available`);
    }
    const safePaymentMethod = paymentMethod;
    const isCardPayment = safePaymentMethod === 'Credit Card';

    if (isCardPayment && !getStripe()) {
      res.status(503);
      throw new Error('Card payments are not available right now. Please choose Cash on Delivery.');
    }

    // Free up stock held by this shopper's abandoned card checkouts first
    if (isCardPayment) await releaseStaleUnpaidOrders(req.user._id);

    // Verify stock availability and prepare items with database-validated prices
    let subtotal = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        res.status(400);
        throw new Error('Invalid product identifier in order items');
      }

      const rawQuantity = parseInt(item.quantity, 10);
      if (!Number.isInteger(rawQuantity) || rawQuantity <= 0 || rawQuantity > 100) {
        res.status(400);
        throw new Error('Invalid product quantity specified (must be between 1 and 100)');
      }

      const product = await Product.findById(item.product);

      if (!product || !product.isActive) {
        res.status(404);
        throw new Error(`Product unavailable or not found: ${item.name || item.product}`);
      }

      if (product.stock < rawQuantity) {
        res.status(400);
        throw new Error(
          `Insufficient stock for "${product.name}". Only ${product.stock} units remaining.`
        );
      }

      // Security: Always use database price, NEVER trust client-submitted prices
      const activePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
      subtotal += activePrice * rawQuantity;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: activePrice,
        quantity: rawQuantity,
        color: typeof item.color === 'string' ? item.color.trim().slice(0, 50) : '',
        size: typeof item.size === 'string' ? item.size.trim().slice(0, 50) : '',
      });
    }

    // Shipping fee rule comes from Site Settings. A promo code may lower either.
    let shippingPrice = await calculateShipping(subtotal);
    let discount = 0;
    let appliedCoupon = null;

    if (typeof couponCode === 'string' && couponCode.trim()) {
      try {
        const result = await evaluateCoupon(couponCode, subtotal, req.user._id);
        discount = result.discount;
        shippingPrice = result.shippingPrice;
        appliedCoupon = result.coupon;
      } catch (couponError) {
        res.status(couponError.statusCode || 400);
        throw couponError;
      }
    }

    const totalPrice = Math.round((subtotal + shippingPrice - discount) * 100) / 100;

    // Atomically decrement stock and handle race conditions
    const decrementedItems = [];
    try {
      for (const item of validatedItems) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          {
            $inc: {
              stock: -item.quantity,
              soldCount: +item.quantity,
            },
          },
          { new: true }
        );

        if (!updated) {
          throw new Error(`Stock depleted for "${item.name}" during checkout.`);
        }
        decrementedItems.push(item);
      }
    } catch (stockError) {
      // Rollback any successfully decremented items if one fails
      for (const rolledItem of decrementedItems) {
        await Product.findByIdAndUpdate(rolledItem.product, {
          $inc: {
            stock: +rolledItem.quantity,
            soldCount: -rolledItem.quantity,
          },
        });
      }
      res.status(400);
      throw stockError;
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress: cleanShipping,
      paymentMethod: safePaymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      subtotal: Math.round(subtotal * 100) / 100,
      shippingPrice,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : '',
      totalPrice,
    });

    if (appliedCoupon) {
      await Coupon.updateOne({ _id: appliedCoupon._id }, { $inc: { usedCount: 1 } });
    }

    if (isCardPayment) {
      // Hand off to Stripe Checkout. The bag stays full until payment succeeds.
      let session;
      try {
        session = await createCheckoutSession(order);
      } catch (stripeError) {
        await cancelOrderAndRestore(order, { reason: 'abandoned' });
        console.error(`[Stripe]: Could not start checkout for order ${order._id}: ${stripeError.message}`);
        res.status(stripeError.statusCode || 502);
        throw new Error('We could not start the card payment. Your order was not placed — please try again or choose Cash on Delivery.');
      }

      return res.status(201).json({
        success: true,
        message: 'Order created — redirecting to secure card payment',
        data: order,
        checkoutUrl: session.url,
      });
    }

    // Cash on Delivery: order is final, empty the customer's cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user's order history
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid order ID format');
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Authorization: only the owner or an admin may view the order
    const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
    if (orderUserId !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel order (if not already shipped) & restore inventory
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid order ID format');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      res.status(400);
      throw new Error(`Cannot cancel order in "${order.orderStatus}" status`);
    }

    // Restores stock and promo use, and refunds the card if it was charged
    try {
      await cancelOrderAndRestore(order);
    } catch (cancelError) {
      res.status(cancelError.statusCode || 502);
      throw cancelError;
    }

    res.status(200).json({
      success: true,
      message:
        order.paymentStatus === 'Refunded'
          ? 'Order cancelled and your card refund has been issued'
          : 'Order cancelled successfully and inventory restored',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
