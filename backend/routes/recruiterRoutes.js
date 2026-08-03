const express = require('express');
const router = express.Router();
const { protect, authorizeRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createInterviewSchema } = require('../validators/schemas');
const recruiterController = require('../controllers/recruiterController');

router.use(protect, authorizeRole('recruiter'));

// 1. Dashboard Overview
router.get('/dashboard', recruiterController.getDashboard);

// 2. Notifications
router.get('/notifications', recruiterController.getNotifications);
router.put('/notifications/:id/read', recruiterController.markNotificationRead);

// 3. Candidate & Interview Management
router.get('/candidates', recruiterController.getCandidates);
router.get('/candidates/:id', recruiterController.getCandidateById);

// Alias for interviews API
router.get('/interviews', recruiterController.getInterviews);
router.post('/schedule', validate(createInterviewSchema), recruiterController.createInterview);
router.put('/interviews/:id/cancel', recruiterController.cancelInterview);

// 4. Reports
router.get('/reports', recruiterController.getReports);

// 5. Analytics Charts
router.get('/analytics', recruiterController.getAnalytics);

module.exports = router;
