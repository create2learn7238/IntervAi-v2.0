const express = require('express');
const router = express.Router();
const { getInterviews, getInterview, createInterview, sendEmailReport, uploadSessionVideo } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createInterviewSchema } = require('../validators/schemas');

router.use(protect);

const rateLimit = require('express-rate-limit');
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many AI requests from this IP, please try again after 15 minutes.' }
});

router.get('/', getInterviews);
router.get('/:mockid', getInterview);
router.post('/', aiLimiter, validate(createInterviewSchema), createInterview);

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '.webm')
});
const upload = multer({ storage });

router.post('/:mockid/video', upload.single('video'), uploadSessionVideo);

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many emails sent. Try again later.'
});

router.post('/send-email-report', emailLimiter, sendEmailReport);

module.exports = router;
