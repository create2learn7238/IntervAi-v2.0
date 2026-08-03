const express = require('express');
const router = express.Router();
const { getInterviews, getInterview, createInterview, sendEmailReport, generatePracticeQuestions } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createInterviewSchema } = require('../validators/schemas');

router.use(protect);
router.get('/practice', generatePracticeQuestions);
router.get('/', getInterviews);
router.get('/:mockid', getInterview);
router.post('/', validate(createInterviewSchema), createInterview);
const rateLimit = require('express-rate-limit');
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many emails sent. Try again later.'
});

router.post('/send-email-report', emailLimiter, sendEmailReport);

module.exports = router;
