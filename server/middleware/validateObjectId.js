const mongoose = require('mongoose');

/**
 * Middleware factory to validate MongoDB ObjectId parameters
 * @param {string} paramName - Name of the route parameter (default: 'id')
 */
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    return next(new Error(`Invalid resource ID format: "${id}". Must be a valid 24-character ObjectId.`));
  }
  return next();
};

module.exports = validateObjectId;
