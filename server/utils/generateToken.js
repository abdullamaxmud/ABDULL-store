const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production!');
    }
    console.warn('⚠️ WARNING: Using fallback development JWT_SECRET. Set JWT_SECRET in your .env file for production.');
    return 'abdull_ecommerce_dev_fallback_secret_key_2026_do_not_use_in_prod';
  }
  return secret;
};

/**
 * Generate JSON Web Token for authenticated user
 * @param {string} id - User ObjectId
 * @param {string} role - User role ('customer' | 'admin')
 * @returns {string} Signed JWT
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
      algorithm: 'HS256',
    }
  );
};

module.exports = generateToken;
