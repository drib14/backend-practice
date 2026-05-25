const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Helper to generate 6-digit verification code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Creates active account immediately and sends Welcome Email)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, acceptedTerms } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    if (!acceptedTerms) {
      return res.status(400).json({ message: 'You must accept the Terms and Conditions' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'A user account with this email already exists' });
    }

    // Create user (verified by default!)
    const user = await User.create({
      name,
      email,
      password,
      acceptedTerms,
      isVerified: true, // Verification is bypassable on registration
      acceptedTermsAt: Date.now(),
    });

    const token = signToken(user._id);

    // Send Welcome Email
    try {
      await sendEmail({
        email: user.email,
        subject: `Welcome to Keyshien's Accessories!`,
        headerTitle: "Keyshien's Accessories",
        bodyText: `Hello ${user.name}, thank you for registering with Keyshien's Accessories! Your account is now fully active. Start exploring our exclusive jewelry, heart-shaped glasses, and custom accessories catalog!`,
        code: 'ACTIVE',
        expiryMinutes: 999999, // Welcome email, code is just a welcome placeholder
      });
    } catch (emailErr) {
      console.warn('Welcome email failed to dispatch:', emailErr.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Welcome to Keyshien\'s Accessories.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// @desc    User Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// @desc    Forgot Password (Generates 6-digit recovery OTP and sends email)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please enter your email address' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate 6-digit reset code
    const otp = generateOTP();
    user.resetPasswordCode = otp;
    user.resetPasswordCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Send reset email
    await sendEmail({
      email: user.email,
      subject: `Keyshien's Accessories - Password Recovery`,
      headerTitle: "Keyshien's Accessories",
      bodyText: `We received a request to reset your password. Please enter the 6-digit recovery OTP code below in your mobile app to establish new secure credentials:`,
      code: otp,
      expiryMinutes: 10,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password recovery OTP sent to your email.',
      email: user.email,
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// @desc    Reset Password using 6-digit recovery OTP code
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Please fill out all fields' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check code
    if (user.resetPasswordCode !== code || user.resetPasswordCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired recovery code' });
    }

    // Save new password (pre-save hook will hash it automatically)
    user.password = newPassword;
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpires = null;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully! You can now log in with your new credentials.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// @desc    Get Current User profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      status: 'success',
      user,
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};
