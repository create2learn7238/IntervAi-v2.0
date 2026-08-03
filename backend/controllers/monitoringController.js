const monitoringService = require('../services/monitoringService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.initSession = catchAsync(async (req, res, next) => {
    const { interviewId, userEmail } = req.body;
    if (!interviewId || !userEmail) {
      return res.status(400).json({ error: 'Missing interviewId or userEmail' });
    }
    const score = await monitoringService.initializeTrustScore(interviewId, userEmail);
    res.status(200).json({ success: true, trustScore: score.score });
  });

exports.logViolation = catchAsync(async (req, res, next) => {
    const { interviewId, userEmail, violationType, description, duration } = req.body;
    if (!interviewId || !userEmail || !violationType) {
      return res.status(400).json({ error: 'Missing required violation fields' });
    }
    
    const result = await monitoringService.logViolation(interviewId, userEmail, violationType, description, duration);
    res.status(201).json({ success: true, data: result });
  });

exports.getSummary = catchAsync(async (req, res, next) => {
    const { mockid } = req.params;
    if (!mockid) return res.status(400).json({ error: 'Missing interview id' });

    const summary = await monitoringService.getInterviewSummary(mockid);
    res.status(200).json({ success: true, data: summary });
  });
