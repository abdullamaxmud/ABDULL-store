const rateLimit = require('express-rate-limit');

/**
 * Global API rate limiter - 300 requests per 15 minutes per IP in production.
 * Development gets a higher ceiling: React StrictMode double-fires every fetch
 * and a single storefront page load issues ~10 API calls.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 300 : 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

/**
 * Strict authentication rate limiter - 10 attempts per 15 minutes per IP
 * Protects against brute-force login attacks and credential stuffing
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Order placement rate limiter - 25 order submissions per hour per IP
 * Protects against inventory denial-of-service and bot spam
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many order requests submitted. Please try again shortly.',
  },
});

/**
 * Public form limiter (contact + newsletter) - 15 submissions per hour per IP
 */
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many form submissions. Please try again later.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  orderLimiter,
  formLimiter,
};
