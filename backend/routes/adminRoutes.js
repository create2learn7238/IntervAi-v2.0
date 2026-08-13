const express = require('express');
const router = express.Router();
const { protect, authorizeRole } = require('../middleware/auth');
const User = require('../models/User');
const Interview = require('../models/Interview');
const Violation = require('../models/Violation');
const SiteFeedback = require('../models/SiteFeedback');
const rateLimit = require('express-rate-limit');

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many admin requests from this IP, please try again after 15 minutes.' }
});

// Admin only routes
router.use(protect, authorizeRole('admin'), adminLimiter);

router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'All') {
      query.role = role.toLowerCase();
    }
    if (status && status !== 'All') {
      query.placementStatus = status; // Adjust based on your status field mapping
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: {
        users,
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    // Soft delete can just be setting an active flag, but for now we hard delete as per standard fallback, or soft delete by flag
    await User.findByIdAndUpdate(req.params.id, { placementStatus: 'Not Active' }); // Pseudo soft-delete
    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'recruiter', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }
    
    // Prevent admin from demoting themselves by accident
    if (req.user._id.toString() === req.params.id && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot demote yourself' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires -otp -otpExpires');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.put('/users/:id/suspend', async (req, res) => {
  try {
    const { isSuspended } = req.body;
    
    if (req.user._id.toString() === req.params.id && isSuspended) {
      return res.status(400).json({ error: 'You cannot suspend yourself' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended }, { new: true }).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires -otp -otpExpires');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user suspension status' });
  }
});

router.get('/interviews', async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ createdAt: -1 });
    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

router.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await SiteFeedback.find().sort({ createdAt: -1 });
    res.json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

module.exports = router;
