const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const resumeService = require('../services/resumeService');

// Ensure uploads/resumes directory exists
const uploadDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let storage;
let s3Client;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.AWS_BUCKET_NAME) {
  const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
  const multerS3 = require('multer-s3');
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });

  storage = multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'resumes/' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

// File Filter for PDF & DOCX
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, and TXT are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { protect } = require('../middleware/auth');

const rateLimit = require('express-rate-limit');
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many uploads from this IP, please try again after an hour'
});

router.use(protect);

// POST /api/resume/upload
router.post('/upload', uploadLimiter, upload.single('resume'), catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a valid resume file', 400));
  }

    const { jobTitle, jobDescription } = req.body;

    // Call real ATS Parsing service (handle local vs S3 path)
    const filePath = req.file.location || req.file.path; // location is from S3
    const filename = req.file.key || req.file.filename; // key is from S3
    
    let analysisResult = { matchScore: 0, analysis: {} };
    
    if (req.file.location) {
      try {
        const { GetObjectCommand } = require('@aws-sdk/client-s3');
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: req.file.key,
        });
        const response = await s3Client.send(command);
        const streamToBuffer = (stream) =>
          new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks)));
          });
        const s3Buffer = await streamToBuffer(response.Body);
        analysisResult = await resumeService.analyzeResumeBuffer(s3Buffer, jobTitle);
      } catch (err) {
        console.error("Failed to stream S3 file:", err);
        analysisResult = {
          matchScore: 0,
          summary: "Failed to download and parse resume from cloud storage.",
          keywordsFound: [],
          missingKeywords: [],
          atsFormattingScore: 0,
          recommendations: ['Please try uploading again.']
        };
      }
    } else {
      analysisResult = await resumeService.analyzeResume(filePath, jobTitle);
    }

    res.json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      filename,
      matchScore: analysisResult.matchScore,
      analysis: analysisResult
    });
}));

module.exports = router;
