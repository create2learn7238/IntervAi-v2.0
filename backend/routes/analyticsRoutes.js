const express = require('express');
const router = express.Router();
const { getAdminAnalytics, getRecruiterAnalytics, getCandidateAnalytics, getPlatformAnalytics } = require('../controllers/analyticsController');
const { protect, authorizeRole } = require('../middleware/auth');

// We leave the old /summary unprotected or protected, but let's override it cleanly
router.get('/admin', protect, authorizeRole('admin'), getAdminAnalytics);
router.get('/recruiter', protect, authorizeRole('recruiter'), getRecruiterAnalytics);
router.get('/candidate', protect, authorizeRole('student', 'admin', 'recruiter'), getCandidateAnalytics);
router.get('/platform', getPlatformAnalytics);

// Legacy fallback for AdminAnalytics if needed, though we will rewrite AdminAnalytics
router.get('/summary', protect, authorizeRole('admin'), getAdminAnalytics);

module.exports = router;
