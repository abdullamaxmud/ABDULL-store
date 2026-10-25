// Single source of the JWT signing secret, used to both create and verify tokens.
// In production a real secret is mandatory: the development fallback below is
// public (it is in the repository), so it must never sign or accept tokens online.
const DEV_FALLBACK = 'abdull_ecommerce_dev_fallback_secret_key_2026_do_not_use_in_prod';
const MIN_PRODUCTION_LENGTH = 32;

let warned = false;

const getJwtSecret = () => {
  const secret = (process.env.JWT_SECRET || '').trim();
  if (process.env.NODE_ENV === 'production') {
    if (secret.length < MIN_PRODUCTION_LENGTH || secret === DEV_FALLBACK) {
      throw new Error(`JWT_SECRET must be set to a random value of at least ${MIN_PRODUCTION_LENGTH} characters in production`);
    }
    return secret;
  }
  if (!secret) {
    if (!warned) {
      console.warn('⚠️ WARNING: Using the development JWT secret. Set JWT_SECRET in server/.env before going online.');
      warned = true;
    }
    return DEV_FALLBACK;
  }
  return secret;
};

module.exports = { getJwtSecret, MIN_PRODUCTION_LENGTH };
