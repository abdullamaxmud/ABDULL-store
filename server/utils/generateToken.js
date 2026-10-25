const jwt = require('jsonwebtoken');

const { getJwtSecret } = require('../config/jwt');

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
