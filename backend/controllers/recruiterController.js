const catchAsync = require('../utils/catchAsync');
const Interview = require('../models/Interview');
const TrustScore = require('../models/TrustScore');
const UserAnswer = require('../models/UserAnswer');
const Violation = require('../models/Violation');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const analyticsService = require('../services/analyticsService');
const { getRecommendation } = analyticsService;

exports.getDashboard = catchAsync(async (req, res, next) => {
    const interviews = await Interview.find({ createdby: req.user.email });
    const mockIds = interviews.map(i => i.mockid);
    
    const [completed, avgTrust, trustScoresList, answers] = await Promise.all([
      UserAnswer.distinct('mockidRef', { mockidRef: { $in: mockIds } }).then(r => r.length),
      TrustScore.aggregate([
        { $match: { interviewId: { $in: mockIds } } },
        { $group: { _id: null, avg: { $avg: '$score' } } }
      ]),
      TrustScore.find({ interviewId: { $in: mockIds } }),
      UserAnswer.find({ mockidRef: { $in: mockIds } })
    ]);

    let totalScore = 0;
    let answerCount = 0;
    answers.forEach(a => {
      const s = parseFloat(a.rating);
      if (!isNaN(s)) { totalScore += s; answerCount++; }
    });
    const avgAiScore = answerCount > 0 ? (totalScore / answerCount).toFixed(1) : 0;
    const requiresReviewCount = trustScoresList.filter(t => t.score < 70).length;

    res.json({
      success: true,
      data: {
        totalCandidates: [...new Set(interviews.map(i => i.candidateEmail || 'Unknown'))].length,
        scheduledInterviews: interviews.filter(i => i.status === 'Scheduled').length,
        activeInterviews: interviews.filter(i => i.status !== 'Completed' && i.status !== 'Cancelled').length,
        completedInterviews: completed,
        averageCandidateScore: avgAiScore,
        averageTrustScore: avgTrust[0] ? parseFloat(avgTrust[0].avg.toFixed(1)) : 100,
        candidatesRequiringReview: requiresReviewCount,
        reportsPendingReview: completed 
      }
  });
});

exports.getNotifications = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const notifications = await Notification.find({ recruiterEmail: req.user.email })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalCount = await Notification.countDocuments({ recruiterEmail: req.user.email });

    res.json({ success: true, data: notifications, page, totalPages: Math.ceil(totalCount / limit), totalCount });
});

exports.markNotificationRead = catchAsync(async (req, res, next) => {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
});

exports.getCandidates = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const interviews = await Interview.find({ createdby: req.user.email })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    const totalCount = await Interview.countDocuments({ createdby: req.user.email });

    const enriched = await Promise.all(interviews.map(async (i) => {
      const trust = await TrustScore.findOne({ interviewId: i.mockid });
      const answers = await UserAnswer.find({ mockidRef: i.mockid });
      let scoreSum = 0; let count = 0;
      answers.forEach(a => {
        const s = parseFloat(a.rating);
        if (!isNaN(s)) { scoreSum += s; count++; }
      });
      const aiScore = count > 0 ? (scoreSum / count).toFixed(1) : 0;
      const tScore = trust ? trust.score : 100;
      
      return {
        ...i,
        trustScore: tScore,
        aiScore,
        recommendation: getRecommendation(tScore, aiScore)
      };
    }));

    res.json({ success: true, data: enriched, page, totalPages: Math.ceil(totalCount / limit), totalCount });
});

exports.getCandidateById = catchAsync(async (req, res, next) => {
    const mockid = req.params.id;
    const interview = await Interview.findOne({ mockid, createdby: req.user.email }).lean();
    if (!interview) return res.status(404).json({ error: 'Not found' });

    let targetEmail = interview.candidateEmail || interview.createdby;
    let user = null;
    if (targetEmail) {
      user = await User.findOne({ email: targetEmail }, '-password').lean();
    }

    const answers = await UserAnswer.find({ mockidRef: mockid }).lean();
    const violations = await Violation.find({ interviewId: mockid }).sort({ createdAt: -1 }).lean();
    const trustScoreObj = await TrustScore.findOne({ interviewId: mockid }).lean();
    const trustScore = trustScoreObj ? trustScoreObj.score : 100;
    
    let scoreSum = 0; let count = 0;
    answers.forEach(a => {
      const s = parseFloat(a.rating);
      if (!isNaN(s)) { scoreSum += s; count++; }
    });
    const aiScore = count > 0 ? (scoreSum / count).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        interview,
        user,
        answers,
        violations,
        trustScore,
        aiScore,
        recommendation: getRecommendation(trustScore, aiScore)
      }
  });
});

exports.getInterviews = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const interviews = await Interview.find({ createdby: req.user.email })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    const totalCount = await Interview.countDocuments({ createdby: req.user.email });

    const enriched = await Promise.all(interviews.map(async (i) => {
      const trust = await TrustScore.findOne({ interviewId: i.mockid });
      const violations = await Violation.countDocuments({ interviewId: i.mockid });
      return { ...i, trustScore: trust ? trust.score : 100, violationsCount: violations };
    }));

    res.json({ success: true, data: enriched, page, totalPages: Math.ceil(totalCount / limit), totalCount });
});

exports.createInterview = catchAsync(async (req, res, next) => {
    const { candidateEmail, jobposition, jobdescription, jobexp, scheduledDate } = req.body;
    
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const mockid = uuidv4();
      const newInterview = await Interview.create([{
        mockid,
        jsonmockresp: '[]',
        jobposition,
        jobdescription,
        jobexp,
        createdby: req.user.email,
        candidateEmail,
        scheduledDate,
        status: 'Scheduled'
      }], { session });

      await Notification.create([{
        recruiterEmail: req.user.email,
        type: 'SUCCESS',
        message: `Interview scheduled for ${candidateEmail} as ${jobposition}.`,
        link: `/dashboard/recruiter/candidate/${mockid}`
      }], { session });

      await session.commitTransaction();
      res.status(201).json({ success: true, data: newInterview[0] });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
});

exports.cancelInterview = catchAsync(async (req, res, next) => {
    const interview = await Interview.findOneAndUpdate(
      { mockid: req.params.id, createdby: req.user.email },
      { status: 'Cancelled' },
      { new: true }
    );
    res.json({ success: true, data: interview });
});

exports.getReports = catchAsync(async (req, res, next) => {
    const { mockid } = req.query;
    if (!mockid) return res.status(400).json({ error: 'mockid required' });
    
    const [answers, violations, trustScore, interview, cert] = await Promise.all([
      UserAnswer.find({ mockidRef: mockid }),
      Violation.find({ interviewId: mockid }).sort({ createdAt: -1 }),
      TrustScore.findOne({ interviewId: mockid }),
      Interview.findOne({ mockid }),
      Certificate.findOne({ interviewId: mockid })
    ]);

    res.json({ success: true, data: { answers, violations, trustScore, interview, cert } });
});

exports.getAnalytics = catchAsync(async (req, res, next) => {
    const analyticsData = await analyticsService.getRecruiterAnalytics(req.user.email);
    res.json({
      success: true,
      data: analyticsData
  });
});
