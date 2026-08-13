require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorMiddleware');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const siteFeedbackRoutes = require('./routes/siteFeedbackRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Security & middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) 
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      process.env.CORS_ORIGIN === '*' ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.onrender.com') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Cookie parser for JWT
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/v1/', limiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/monitor', monitoringRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/recruiter', recruiterRoutes);
app.use('/api/v1/certificates', certificateRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/site-feedback', siteFeedbackRoutes);

// Health check
const mongoose = require('mongoose');

// Automated Seed Endpoint for Online Atlas Database
const { runSeed } = require('./services/seedService');
app.all('/api/v1/seed-database', async (req, res) => {
  try {
    const result = await runSeed();
    res.status(200).json({
      success: true,
      message: 'Database successfully seeded on MongoDB Atlas!',
      data: result
    });
  } catch (err) {
    console.error('Seed Endpoint Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Improved Health Check with DB Status
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is running',
    dbConnected: mongoose.connection.readyState === 1,
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('============================================');
  console.log(`🚀 IntervAI MERN Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/v1`);
  console.log('============================================');
});
