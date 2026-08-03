const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

router.get('/:filename', protect, (req, res) => {
  const { filename } = req.params;
  
  // Try finding the file in uploads or uploads/resumes or uploads/videos
  const baseDir = path.join(__dirname, '..', 'uploads');
  const possiblePaths = [
    path.join(baseDir, filename),
    path.join(baseDir, 'resumes', filename),
    path.join(baseDir, 'videos', filename),
  ];

  let foundPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      foundPath = p;
      break;
    }
  }

  if (!foundPath) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(foundPath);
});

module.exports = router;
