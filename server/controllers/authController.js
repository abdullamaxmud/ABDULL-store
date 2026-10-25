const validator = require('validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Maximum consecutive failed login attempts before temporary lockout
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, city, country } = req.body;

    // Strict type and existence checks
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400);
      throw new Error('Please provide a valid full name');
    }

    if (!email || typeof email !== 'string' || !validator.isEmail(email.trim())) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    if (!password || typeof password !== 'string') {
      res.status(400);
      throw new Error('Please provide a valid password');
    }

    if (password.length < 8 || password.length > 128) {
      res.status(400);
      throw new Error('Password must be between 8 and 128 characters long');
    }

    const cleanEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      res.status(400);
      throw new Error('An account with this email address already exists');
    }

    // First registered user can optionally be admin if none exists, else customer
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'customer';

    const user = await User.create({
      name: name.trim().slice(0, 60),
      email: cleanEmail,
      password,
      phone: typeof phone === 'string' ? phone.trim().slice(0, 30) : '',
      address: typeof address === 'string' ? address.trim().slice(0, 150) : '',
      city: typeof city === 'string' ? city.trim().slice(0, 60) : '',
      country: typeof country === 'string' ? country.trim().slice(0, 60) : 'United States',
      role,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & retrieve token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      res.status(400);
      throw new Error('Please provide both valid email and password');
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user with password and security lock fields
    const user = await User.findOne({ email: cleanEmail }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      // Use generic error message to prevent account enumeration
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Check if account is temporarily locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      res.status(423); // 423 Locked
      throw new Error(
        `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`
      );
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('This account has been deactivated. Please contact support.');
    }

    // A password edited directly in the database (e.g. MongoDB Compass) is stored as plain
    // text and can never match the bcrypt check. Say so in the server log instead of failing silently.
    if (!/^\$2[aby]\$\d\d\$/.test(user.password || '')) {
      console.warn(
        `[Auth]: The password for ${user.email} is not encrypted (probably edited directly in the database). ` +
          'Reset it with: node utils/updateCredentials.js <admin|customer> "<name>" "<email>" "<new password>"'
      );
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment failed attempts and lock if threshold reached
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      }
      await user.save();

      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Reset failed login attempts on successful authentication
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { name, email, phone, address, city, country, avatar } = req.body;

    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim().slice(0, 60);
    }

    if (email && typeof email === 'string' && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (!validator.isEmail(cleanEmail)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
      }
      if (cleanEmail !== user.email) {
        const existingUser = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
        if (existingUser) {
          res.status(400);
          throw new Error('This email address is already in use by another account');
        }
        user.email = cleanEmail;
      }
    }

    if (phone !== undefined && typeof phone === 'string') {
      user.phone = phone.trim().slice(0, 30);
    }
    if (address !== undefined && typeof address === 'string') {
      user.address = address.trim().slice(0, 150);
    }
    if (city !== undefined && typeof city === 'string') {
      user.city = city.trim().slice(0, 60);
    }
    if (country !== undefined && typeof country === 'string') {
      user.country = country.trim().slice(0, 60);
    }

    if (avatar && typeof avatar === 'string') {
      const trimmedAvatar = avatar.trim();
      // Support remote HTTP(S) URLs as well as Base64 data image uploads
      if (
        trimmedAvatar.startsWith('https://') ||
        trimmedAvatar.startsWith('http://') ||
        trimmedAvatar.startsWith('data:image/')
      ) {
        user.avatar = trimmedAvatar;
      }
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== 'string' || !newPassword || typeof newPassword !== 'string') {
      res.status(400);
      throw new Error('Please provide both current and new password');
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      res.status(400);
      throw new Error('New password must be between 8 and 128 characters long');
    }

    if (newPassword === currentPassword) {
      res.status(400);
      throw new Error('New password must be different from current password');
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400);
      throw new Error('Current password does not match');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updatePassword,
};
