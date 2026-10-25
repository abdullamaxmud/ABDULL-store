const Stripe = require('stripe');

let client = null;
let warned = false;

/**
 * Lazily create the Stripe client from STRIPE_SECRET_KEY.
 * Returns null when card payments are not configured, so the rest of the
 * store keeps working with Cash on Delivery only.
 *
 * Outside production only test keys (sk_test_ / rk_test_) are accepted, so a
 * live key pasted into a dev .env can never charge a real card.
 */
const getStripe = () => {
  if (client) return client;

  const key = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!key) return null;

  const isTestKey = key.startsWith('sk_test_') || key.startsWith('rk_test_');
  if (!isTestKey && process.env.NODE_ENV !== 'production') {
    if (!warned) {
      console.warn('[Stripe]: A live key is set but NODE_ENV is not "production" — card payments disabled. Use an sk_test_ key in development.');
      warned = true;
    }
    return null;
  }

  client = new Stripe(key);
  return client;
};

const isStripeTestMode = () => (process.env.STRIPE_SECRET_KEY || '').trim().startsWith('sk_test_') || (process.env.STRIPE_SECRET_KEY || '').trim().startsWith('rk_test_');

const getClientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

module.exports = { getStripe, isStripeTestMode, getClientUrl };
