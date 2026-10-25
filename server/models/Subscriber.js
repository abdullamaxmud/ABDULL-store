const mongoose = require('mongoose');
const validator = require('validator');

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },
  },
  {
    timestamps: true,
  }
);

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
