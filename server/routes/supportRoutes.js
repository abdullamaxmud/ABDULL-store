const express = require('express');
const router = express.Router();
const {
  subscribeNewsletter,
  submitContactMessage,
  getContactMessages,
  updateContactMessage,
} = require('../controllers/supportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { formLimiter } = require('../middleware/rateLimiter');

router.post('/newsletter', formLimiter, subscribeNewsletter);
router.post('/contact', formLimiter, submitContactMessage);

router.get('/messages', protect, adminOnly, getContactMessages);
router.put('/messages/:id', protect, adminOnly, updateContactMessage);

module.exports = router;
