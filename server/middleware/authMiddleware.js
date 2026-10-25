const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { getJwtSecret } = require('../config/jwt');

/**
 * Middleware: Verify JWT Bearer token or cookie and populate req.user
 */
const protect = async (req, res, next) => {
  let token;

  // Extract from Authorization header (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Fallback to HTTP-only cookie if used
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    return next(new Error('Access denied. No authentication token provided.'));
  }

  try {
    // Decode and verify token
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });

    if (!decoded || !decoded.id) {
      res.status(401);
      return next(new Error('Invalid token payload. Authorization denied.'));
    }

    // Find user by ID and attach to request object
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      return next(new Error('User account not found or has been removed. Authorization denied.'));
    }

    if (!user.isActive) {
      res.status(403);
      return next(new Error('This user account has been deactivated. Please contact support.'));
    }

    req.user = user;
    return next();
  } catch (error) {
    res.status(401);
    return next(error);
  }
};

/**
 * Middleware: Ensure authenticated user holds 'admin' privilege
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  return next(new Error('Access denied. Administrator privileges required.'));
};

module.exports = { protect, adminOnly };
