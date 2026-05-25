const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect Routes - Validates Bearer Token and Populates req.user
const protect = async (req, res, next) => {
  let token;

  // Check for Authorization Header starting with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token string
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      error: 'Not authorized',
      message: 'Access denied. No authorization token was provided.'
    });
  }

  try {
    // Verify Token payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Retrieve user model excluding password
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        error: 'Not authorized',
        message: 'The user account associated with this token no longer exists.'
      });
    }

    next();
  } catch (error) {
    console.error(`[Auth Middleware Error] ${error.message}`);
    return res.status(401).json({
      error: 'Not authorized',
      message: 'Access denied. The authorization token is invalid or expired.'
    });
  }
};

// Authorize Roles - Access controls by user roles (e.g., admin, seller)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
