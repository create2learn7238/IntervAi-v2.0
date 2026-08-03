const express = require('express');
const router = express.Router();
const { protect, authorizeRole } = require('../middleware/auth');
const User = require('../models/User');
const Interview = require('../models/Interview');
const Violation = require('../models/Violation');

// Admin only routes
router.use(protect, authorizeRole('admin'));

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
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

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
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

module.exports = router;
