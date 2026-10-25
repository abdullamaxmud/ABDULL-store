const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a valid name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid email address'],
      unique: true,
      trim: true,
      lowercase: true,
      // validator.isEmail accepts modern TLDs (.shop, .online, ...) that a 2-3 letter regex rejects
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      maxlength: [128, 'Password cannot exceed 128 characters'],
      select: false, // Omit password from queries by default for security
    },
    phone: {
      type: String,
      default: '',
      trim: true,
      maxlength: [30, 'Phone cannot exceed 30 characters'],
    },
    address: {
      type: String,
      default: '',
      trim: true,
      maxlength: [150, 'Address cannot exceed 150 characters'],
    },
    city: {
      type: String,
      default: '',
      trim: true,
      maxlength: [60, 'City cannot exceed 60 characters'],
    },
    country: {
      type: String,
      default: 'United States',
      trim: true,
      maxlength: [60, 'Country cannot exceed 60 characters'],
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ role: 1 });

// Pre-save hook: Hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
