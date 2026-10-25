const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Subscriber = require('../models/Subscriber');
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');

// Code handed out to newsletter subscribers (seeded by utils/seedExtras.js)
const NEWSLETTER_COUPON = 'ABDULL15';

/**
 * Resolve the signed-in user from a Bearer token without requiring one.
 */
const optionalUser = async (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    const secret = process.env.JWT_SECRET || 'abdull_ecommerce_dev_fallback_secret_key_2026_do_not_use_in_prod';
    const decoded = jwt.verify(header.split(' ')[1], secret, { algorithms: ['HS256'] });
    return decoded && decoded.id ? await User.findById(decoded.id).select('_id') : null;
  } catch {
    return null;
  }
};

/**
 * @desc    Subscribe an email to the newsletter and return the welcome code
 * @route   POST /api/support/newsletter
 * @access  Public
 */
const subscribeNewsletter = async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase().slice(0, 100) : '';
    if (!email) {
      res.status(400);
      throw new Error('Please provide an email address');
    }

    const existing = await Subscriber.findOne({ email });
    if (!existing) {
      await Subscriber.create({ email });
    }

    res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? 'You are already subscribed — here is your code again.' : 'Welcome to the club!',
      data: { couponCode: NEWSLETTER_COUPON },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a contact / support message
 * @route   POST /api/support/contact
 * @access  Public
 */
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, topic, orderNumber, message } = req.body;
    const user = await optionalUser(req);

    const doc = await ContactMessage.create({
      name: typeof name === 'string' ? name : '',
      email: typeof email === 'string' ? email : '',
      topic: typeof topic === 'string' ? topic : 'Other',
      orderNumber: typeof orderNumber === 'string' ? orderNumber : '',
      message: typeof message === 'string' ? message : '',
      user: user ? user._id : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Thanks! Our support team will reply within 24 hours.',
      data: { _id: doc._id, createdAt: doc.createdAt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List contact messages
 * @route   GET /api/support/messages
 * @access  Private/Admin
 */
const getContactMessages = async (req, res, next) => {
  try {
    const filter = {};
    if (['New', 'Read', 'Resolved'].includes(req.query.status)) filter.status = req.query.status;

    const [messages, subscriberCount] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).limit(200),
      Subscriber.countDocuments(),
    ]);

    res.status(200).json({ success: true, count: messages.length, subscriberCount, data: messages });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a contact message status
 * @route   PUT /api/support/messages/:id
 * @access  Private/Admin
 */
const updateContactMessage = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid message ID format');
    }
    if (!['New', 'Read', 'Resolved'].includes(req.body.status)) {
      res.status(400);
      throw new Error('Status must be New, Read or Resolved');
    }

    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!msg) {
      res.status(404);
      throw new Error('Message not found');
    }

    res.status(200).json({ success: true, data: msg });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribeNewsletter,
  submitContactMessage,
  getContactMessages,
  updateContactMessage,
};
