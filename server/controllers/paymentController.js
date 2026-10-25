const mongoose = require('mongoose');
const Order = require('../models/Order');
const { getStripe, isStripeTestMode, getClientUrl } = require('../config/stripe');
const { cancelOrderAndRestore, markOrderPaid } = require('../utils/orderLifecycle');

const CURRENCY = 'usd';
const toCents = (amount) => Math.round(amount * 100);

// Unpaid card orders hold stock; release them once their payment page has expired
const STALE_UNPAID_MINUTES = 35;

/**
 * Create a Stripe Checkout Session for an order whose totals were already
 * computed server-side. Stripe is told the exact same amounts.
 */
const createCheckoutSession = async (order) => {
  const stripe = getStripe();
  if (!stripe) {
    const err = new Error('Card payments are not available right now. Please choose Cash on Delivery.');
    err.statusCode = 503;
    throw err;
  }

  const clientUrl = getClientUrl();
  const orderId = order._id.toString();

  const params = {
    mode: 'payment',
    client_reference_id: orderId,
    customer_email: order.shippingAddress?.email || undefined,
    metadata: { orderId },
    payment_intent_data: { metadata: { orderId } },
    line_items: order.orderItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: CURRENCY,
        unit_amount: toCents(item.price),
        product_data: {
          name: item.name.slice(0, 250),
          ...(item.image && /^https:\/\//.test(item.image) ? { images: [item.image] } : {}),
          ...([item.color, item.size].filter(Boolean).length
            ? { description: [item.color, item.size].filter(Boolean).join(' · ') }
            : {}),
        },
      },
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: order.shippingPrice === 0 ? 'Free standard shipping' : 'Standard shipping',
          fixed_amount: { amount: toCents(order.shippingPrice), currency: CURRENCY },
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      },
    ],
    // Stripe's minimum session lifetime is 30 minutes
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${clientUrl}/order-success/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/checkout?payment=cancelled&order=${orderId}`,
  };

  if (order.discount > 0) {
    // One-off Stripe coupon mirroring the discount our own promo engine computed
    const stripeCoupon = await stripe.coupons.create({
      amount_off: toCents(order.discount),
      currency: CURRENCY,
      duration: 'once',
      max_redemptions: 1,
      name: order.couponCode ? `Promo ${order.couponCode}` : 'Discount',
    });
    params.discounts = [{ coupon: stripeCoupon.id }];
  }

  const session = await stripe.checkout.sessions.create(params);

  if (session.amount_total !== toCents(order.totalPrice)) {
    console.warn(`[Stripe]: Session total ${session.amount_total} differs from order total ${toCents(order.totalPrice)} for ${orderId}`);
  }

  order.stripeSessionId = session.id;
  await order.save();

  return session;
};

/**
 * Release stock held by this user's abandoned card orders (payment page expired).
 */
const releaseStaleUnpaidOrders = async (userId) => {
  if (!getStripe()) return;
  const cutoff = new Date(Date.now() - STALE_UNPAID_MINUTES * 60 * 1000);
  const stale = await Order.find({
    user: userId,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    createdAt: { $lt: cutoff },
  });
  for (const order of stale) {
    try {
      await cancelOrderAndRestore(order, { reason: 'abandoned' });
    } catch (err) {
      console.warn(`[Stripe]: Could not release stale order ${order._id}: ${err.message}`);
    }
  }
};

/**
 * @desc    Tell the storefront which payment methods are available
 * @route   GET /api/payments/config
 * @access  Public
 */
const getPaymentConfig = (req, res) => {
  const enabled = !!getStripe();
  res.status(200).json({
    success: true,
    data: {
      cardEnabled: enabled,
      testMode: enabled && isStripeTestMode(),
    },
  });
};

const loadOwnOrder = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this order');
  }
  return order;
};

/**
 * @desc    Confirm a card payment after Stripe redirects the shopper back.
 *          Works without webhooks (local development); the webhook does the
 *          same thing server-to-server in production.
 * @route   GET /api/payments/verify/:orderId
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    let order = await loadOwnOrder(req, res);

    if (order.paymentMethod === 'Credit Card' && order.paymentStatus === 'Pending' && order.stripeSessionId) {
      const stripe = getStripe();
      if (stripe) {
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        if (session.payment_status === 'paid') {
          order = await markOrderPaid(order, session);
        } else if (session.status === 'expired' && order.orderStatus === 'Pending') {
          order = await cancelOrderAndRestore(order, { reason: 'abandoned' });
        }
      }
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a payment page for an unpaid card order (reuse the open one or start a new one)
 * @route   POST /api/payments/retry/:orderId
 * @access  Private
 */
const retryPayment = async (req, res, next) => {
  try {
    const order = await loadOwnOrder(req, res);

    if (order.paymentMethod !== 'Credit Card' || order.paymentStatus !== 'Pending' || order.orderStatus !== 'Pending') {
      res.status(400);
      throw new Error('This order is not awaiting card payment');
    }

    const stripe = getStripe();
    if (stripe && order.stripeSessionId) {
      const existing = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (existing.payment_status === 'paid') {
        await markOrderPaid(order, existing);
        return res.status(200).json({ success: true, data: { alreadyPaid: true } });
      }
      if (existing.status === 'open' && existing.url) {
        return res.status(200).json({ success: true, data: { checkoutUrl: existing.url } });
      }
    }

    const session = await createCheckoutSession(order);
    res.status(200).json({ success: true, data: { checkoutUrl: session.url } });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * @desc    Stripe webhook (raw body, signature verified)
 * @route   POST /api/payments/webhook
 * @access  Stripe only
 */
const handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const secret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  if (!stripe || !secret) {
    return res.status(503).json({ success: false, message: 'Stripe webhooks are not configured' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], secret);
  } catch (err) {
    console.warn(`[Stripe]: Webhook signature check failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const session = event.data.object;
    const orderId = session?.metadata?.orderId || session?.client_reference_id;
    const order = orderId && mongoose.Types.ObjectId.isValid(orderId) ? await Order.findById(orderId) : null;

    if (order) {
      switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
          if (session.payment_status === 'paid') await markOrderPaid(order, session);
          break;
        case 'checkout.session.async_payment_failed':
        case 'checkout.session.expired':
          // Only release the order if this is still its current payment page
          if (order.stripeSessionId === session.id && order.paymentStatus === 'Pending') {
            await cancelOrderAndRestore(order, { reason: 'abandoned' });
          }
          break;
        default:
          break;
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`[Stripe]: Webhook handling error for ${event.type}: ${err.message}`);
    // 500 makes Stripe retry later
    res.status(500).json({ received: false });
  }
};

module.exports = {
  createCheckoutSession,
  releaseStaleUnpaidOrders,
  getPaymentConfig,
  verifyPayment,
  retryPayment,
  handleStripeWebhook,
};
