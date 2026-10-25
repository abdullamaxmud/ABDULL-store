const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const { getStripe } = require('../config/stripe');

/**
 * Cancel an order and undo its side effects: restore stock, give the promo
 * code use back, and refund the card payment if it was already captured.
 * Safe to call twice — an already cancelled order is returned untouched.
 */
const cancelOrderAndRestore = async (order, { reason = 'requested_by_customer' } = {}) => {
  if (order.orderStatus === 'Cancelled') return order;

  // An unpaid card order may have just been paid in another tab: check with
  // Stripe before cancelling, and close the payment page if it is still open.
  if (order.paymentMethod === 'Credit Card' && order.paymentStatus === 'Pending' && order.stripeSessionId) {
    const stripe = getStripe();
    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (session.payment_status === 'paid') {
        await markOrderPaid(order, session);
      } else if (session.status === 'open') {
        await stripe.checkout.sessions.expire(order.stripeSessionId);
      }
    }
  }

  // Refund first: if Stripe refuses, the order stays as it was
  if (order.paymentStatus === 'Paid' && order.paymentMethod === 'Credit Card' && order.stripePaymentIntentId) {
    const stripe = getStripe();
    if (!stripe) {
      const err = new Error('Card payments are not configured, so this paid order cannot be refunded automatically.');
      err.statusCode = 503;
      throw err;
    }
    await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId, reason });
    order.paymentStatus = 'Refunded';
  } else if (order.paymentStatus === 'Pending' && order.paymentMethod === 'Credit Card') {
    order.paymentStatus = 'Failed';
  }

  order.orderStatus = 'Cancelled';
  await order.save();

  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: +item.quantity, soldCount: -item.quantity },
    });
  }

  if (order.couponCode) {
    await Coupon.updateOne({ code: order.couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
  }

  return order;
};

/**
 * Record a successful Stripe payment. Idempotent: webhook and the browser
 * return-trip may both report the same session.
 */
const markOrderPaid = async (order, session) => {
  if (order.paymentStatus === 'Paid') return order;

  order.paymentStatus = 'Paid';
  order.paidAt = new Date();
  order.stripePaymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || '';
  if (order.orderStatus === 'Pending') order.orderStatus = 'Confirmed';
  await order.save();

  // The bag is only emptied once the card has actually been charged
  await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

  return order;
};

module.exports = { cancelOrderAndRestore, markOrderPaid };
