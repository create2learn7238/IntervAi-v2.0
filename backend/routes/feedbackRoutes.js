const express = require('express');
const router = express.Router();
const { getFeedback, saveAnswer } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
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

router.use(protect);
router.get('/:mockid', getFeedback);
router.post('/:mockid', upload.single('video'), saveAnswer);

module.exports = router;
