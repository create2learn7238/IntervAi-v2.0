const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth routes
  message: { success: false, message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per windowMs for email endpoints
  message: { success: false, message: 'Too many email requests from this IP, please try again after an hour.' }
});
const { register, login, getMe, updateProfile, verifyRole, forgotPassword, resetPassword, refresh, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/schemas');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', emailLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/verify-role', protect, verifyRole);

module.exports = router;
