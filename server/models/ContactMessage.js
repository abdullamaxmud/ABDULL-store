const mongoose = require('mongoose');
const validator = require('validator');

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      trim: true,
      lowercase: true,
      maxlength: 100,
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    topic: {
      type: String,
      enum: ['Order Issue', 'Returns & Refunds', 'Shipping', 'Product Question', 'Partnership', 'Other'],
      default: 'Other',
    },
    orderNumber: {
      type: String,
      default: '',
      trim: true,
      maxlength: 40,
    },
    message: {
      type: String,
      required: [true, 'Please write a message'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['New', 'Read', 'Resolved'],
      default: 'New',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

contactMessageSchema.index({ createdAt: -1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

module.exports = ContactMessage;
