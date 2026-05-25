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

// @desc    Register a new user (Creates unverified account and sends OTP)
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
      // If user exists but is unverified, resend code and prompt verification
      if (!userExists.isVerified) {
        const otp = generateOTP();
        userExists.verificationCode = otp;
        userExists.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await userExists.save();

        await sendEmail({
          email: userExists.email,
          subject: 'Verify Your Account - Veloce',
          headerTitle: 'Welcome to Veloce',
          bodyText: `Hello ${userExists.name}, you registered previously but have not verified your email. Please use the verification code below to activate your account:`,
          code: otp,
          expiryMinutes: 10,
        });

        return res.status(200).json({
          status: 'unverified',
          message: 'An unverified account already exists. A new verification code has been sent to your email.',
          email: userExists.email,
        });
      }

      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate Verification Code
    const otp = generateOTP();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      acceptedTerms,
      verificationCode: otp,
      verificationCodeExpires,
      acceptedTermsAt: Date.now(),
    });

    // Send Verification Email
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Account - Veloce',
      headerTitle: 'Welcome to Veloce',
      bodyText: `Thank you for signing up for Veloce! Please enter the 6-digit verification code below in your mobile app to verify your email address and activate your account:`,
      code: otp,
      expiryMinutes: 10,
    });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Please check your email for the verification code.',
      email: user.email,
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// @desc    Verify email address using OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Please enter the verification code' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Check code validity
    if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Verify user
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    // Create JWT token
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Account verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify Email Error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// @desc    Resend registration email OTP
// @route   POST /api/auth/resend-code
// @access  Public
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.verificationCode = otp;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Send new email
    await sendEmail({
      email: user.email,
      subject: 'New Verification Code - Veloce',
      headerTitle: 'Account Verification',
      bodyText: `You requested a new verification code. Please enter the 6-digit OTP code below to activate your account:`,
      code: otp,
      expiryMinutes: 10,
    });

    res.status(200).json({
      status: 'success',
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    console.error('Resend Code Error:', error);
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

    // Check if verified
    if (!user.isVerified) {
      // Trigger a verification code resend
      const otp = generateOTP();
      user.verificationCode = otp;
      user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
      await user.save();

      await sendEmail({
        email: user.email,
        subject: 'Verify Your Account - Veloce',
        headerTitle: 'Welcome to Veloce',
        bodyText: `Your account is registered but email verification is pending. Please enter the 6-digit verification code below in your app to activate your account:`,
        code: otp,
        expiryMinutes: 10,
      });

      return res.status(200).json({
        status: 'unverified',
        message: 'Account not verified. A verification code has been sent to your email.',
        email: user.email,
      });
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

// @desc    Forgot Password (Send OTP code)
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
      // For security, don't confirm or deny user existence in public requests,
      // but in e-commerce, it's user-friendly to indicate if not found, or let's say "If user exists, email sent"
      // Let's give a clear message for simple practice/ux:
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset code
    const otp = generateOTP();
    user.resetPasswordCode = otp;
    user.resetPasswordCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Send reset email
    await sendEmail({
      email: user.email,
      subject: 'Reset Password Code - Veloce',
      headerTitle: 'Password Recovery',
      bodyText: `We received a request to reset your password. Use the 6-digit password recovery code below to establish a new password:`,
      code: otp,
      expiryMinutes: 10,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset code sent to your email.',
      email: user.email,
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

// @desc    Reset Password using OTP code
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
    
    // Auto-verify if they reset password successfully
    if (!user.isVerified) {
      user.isVerified = true;
    }
    
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully! You can now log in with your new password.',
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
