const monitoringService = require('../services/monitoringService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.initSession = catchAsync(async (req, res, next) => {
    const { interviewId } = req.body;
    const userEmail = req.user.email; // IDOR Fix: Hardcode from token, do not trust req.body
    if (!interviewId) {
      return res.status(400).json({ error: 'Missing interviewId' });
    }
    const score = await monitoringService.initializeTrustScore(interviewId, userEmail);
    res.status(200).json({ success: true, trustScore: score.score });
  });

exports.logViolation = catchAsync(async (req, res, next) => {
    const { interviewId, violationType, description, duration } = req.body;
    const userEmail = req.user.email; // IDOR Fix: Hardcode from token, do not trust req.body
    if (!interviewId || !violationType) {
      return res.status(400).json({ error: 'Missing required violation fields' });
    }
    
    const result = await monitoringService.logViolation(interviewId, userEmail, violationType, description, duration);
    res.status(201).json({ success: true, data: result });
  });

exports.getSummary = catchAsync(async (req, res, next) => {
    const { mockid } = req.params;
    if (!mockid) return res.status(400).json({ error: 'Missing interview id' });

    // IDOR Fix: verify ownership
    const Interview = require('../models/Interview');
    const interview = await Interview.findOne({ mockid });
    if (!interview || (interview.createdby !== req.user.email && req.user.role !== 'admin' && req.user.role !== 'recruiter')) {
      return res.status(403).json({ error: 'Unauthorized access to this summary' });
    }

    const summary = await monitoringService.getInterviewSummary(mockid);
    res.status(200).json({ success: true, data: summary });
  });
