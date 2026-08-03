const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// POST /api/upload/video
router.post('/video', protect, upload.single('video'), catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  // Construct the URL to access the uploaded file
  const fileUrl = `${req.protocol}://${req.get('host')}/api/media/${req.file.filename}`;

  res.status(201).json({
    success: true,
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
}));

module.exports = router;
