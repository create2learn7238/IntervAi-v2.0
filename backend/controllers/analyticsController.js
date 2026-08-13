const analyticsService = require('../services/analyticsService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAdminAnalytics = catchAsync(async (req, res, next) => {
    const summary = await analyticsService.getAdminSummary();
    res.status(200).json({ success: true, data: summary });
  });

exports.getRecruiterAnalytics = catchAsync(async (req, res, next) => {
    const summary = await analyticsService.getRecruiterSummary(req.user.email);
    res.status(200).json({ success: true, data: summary });
  });

exports.getCandidateAnalytics = catchAsync(async (req, res, next) => {
    const summary = await analyticsService.getCandidateSummary(req.user.email, req.user._id);
    res.status(200).json({ success: true, data: summary });
  });

exports.getPlatformAnalytics = catchAsync(async (req, res, next) => {
    const summary = await analyticsService.getPlatformSummary();
    res.status(200).json({ success: true, data: summary });
  });
