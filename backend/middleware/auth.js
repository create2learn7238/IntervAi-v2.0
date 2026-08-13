const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Not authorized, no token', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new AppError('User not found', 401));
    }

    if (req.user.isSuspended) {
      return next(new AppError('Your account has been suspended due to policy violations.', 403));
    }

    if (req.user.passwordChangedAt && decoded.iat < req.user.passwordChangedAt.getTime() / 1000) {
      return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    next();
  } catch (error) {
    next(new AppError('Not authorized, token failed', 401));
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};

const requireAdmin = authorizeRole('admin');
const requireRecruiter = authorizeRole('recruiter', 'admin'); // Admins can usually do recruiter things

module.exports = { protect, authorizeRole, requireAdmin, requireRecruiter };
