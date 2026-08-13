const catchAsync = require('../utils/catchAsync');
const Interview = require('../models/Interview');
const TrustScore = require('../models/TrustScore');
const UserAnswer = require('../models/UserAnswer');
const Violation = require('../models/Violation');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const CandidateAiProfile = require('../models/CandidateAiProfile');
const mongoose = require('mongoose');
const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');
const { getRecommendation } = analyticsService;

// Utility function to mock AI summary/strengths


exports.getDashboard = catchAsync(async (req, res, next) => {
    // Global stats
    const [totalCandidates, totalInterviews, trustScores] = await Promise.all([
      User.countDocuments({ role: 'student', profileCompleted: true }),
      Interview.countDocuments({ status: 'Completed' }),
      TrustScore.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }])
    ]);

    const avgTrustScore = trustScores[0] ? parseFloat(trustScores[0].avg.toFixed(1)) : 100;
    
    const answers = await UserAnswer.find({}, 'rating');
    let totalScore = 0; let answerCount = 0;
    answers.forEach(a => {
      const s = parseFloat(a.rating);
      if (!isNaN(s)) { totalScore += s; answerCount++; }
    });
    const averageCandidateScore = answerCount > 0 ? (totalScore / answerCount).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalCandidates,
        totalInterviewsCompleted: totalInterviews,
        averageCandidateScore,
        averageTrustScore: avgTrustScore,
        activeCandidates: totalCandidates // simplification
      }
  });
});

exports.getCandidates = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const { skill, targetRole, minScore, search } = req.query;

    const matchStage = { role: 'student', profileCompleted: true };
    if (skill) matchStage.skills = { $regex: skill, $options: 'i' };
    if (targetRole) matchStage.targetRole = { $regex: targetRole, $options: 'i' };
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'interviews',
          localField: 'email',
          foreignField: 'createdby',
          as: 'interviews'
        }
      },
      {
        $lookup: {
          from: 'useranswers',
          localField: 'email',
          foreignField: 'userEmail',
          as: 'useranswers'
        }
      },
      {
        $lookup: {
          from: 'trustscores',
          localField: 'email',
          foreignField: 'userEmail',
          as: 'trustscores'
        }
      },
      {
        $addFields: {
          interviewsCompleted: { $size: "$interviews" },
          lastInterviewDate: { $max: "$interviews.createdAt" },
          aiScore: {
            $cond: {
              if: { $gt: [{ $size: "$useranswers" }, 0] },
              then: { $avg: { $map: { input: "$useranswers", as: "a", in: { $toDouble: "$$a.rating" } } } },
              else: 0
            }
          },
          trustScore: {
            $cond: {
              if: { $gt: [{ $size: "$trustscores" }, 0] },
              then: { $avg: "$trustscores.score" },
              else: 100
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0,
          interviews: 0,
          useranswers: 0,
          trustscores: 0
        }
      }
    ];

    if (minScore) {
      pipeline.push({ $match: { aiScore: { $gte: parseFloat(minScore) } } });
    }

    // Determine total count after filtering
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await User.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Apply sorting, skip, and limit
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const candidates = await User.aggregate(pipeline);

    const enriched = candidates.map(c => ({
      ...c,
      aiScore: parseFloat(c.aiScore).toFixed(1),
      trustScore: Math.round(c.trustScore),
      recommendation: getRecommendation(Math.round(c.trustScore), parseFloat(c.aiScore).toFixed(1))
    }));

    res.json({ success: true, data: enriched, page, totalPages: Math.ceil(totalCount / limit), totalCount });
});

exports.getCandidateById = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findById(userId, '-password -refreshToken -resetPasswordToken -resetPasswordExpires').lean();
    if (!user || user.role !== 'student') return res.status(404).json({ error: 'Candidate not found' });

    // Fetch Interview History
    const interviews = await Interview.find({ createdby: user.email }).sort({ createdAt: -1 }).lean();
    const mockIds = interviews.map(i => i.mockid);

    const answers = await UserAnswer.find({ mockidRef: { $in: mockIds } }).lean();
    const violations = await Violation.find({ interviewId: { $in: mockIds } }).sort({ createdAt: -1 }).lean();
    const trustScores = await TrustScore.find({ interviewId: { $in: mockIds } }).lean();
    
    // Aggregates without Math.random()
    let scoreSum = 0; let count = 0;
    
    answers.forEach(a => {
      const s = parseFloat(a.rating);
      if (!isNaN(s)) { 
        scoreSum += s; count++; 
      }
    });
    const aiScore = count > 0 ? (scoreSum / count).toFixed(1) : 0;
    
    // We remove arbitrary subscores since they were fake
    const technicalScore = aiScore;
    const communicationScore = aiScore;
    const problemSolvingScore = aiScore;

    let tSum = 0; let tCount = 0;
    trustScores.forEach(t => { tSum += t.score; tCount++; });
    const trustScore = tCount > 0 ? Math.round(tSum / tCount) : 100;

    // Map interviews with their scores
    const history = interviews.map(inv => {
      const invAnswers = answers.filter(a => a.mockidRef === inv.mockid);
      let iSum = 0; let iCount = 0;
      invAnswers.forEach(a => { const s = parseFloat(a.rating); if(!isNaN(s)){ iSum += s; iCount++; }});
      const iScore = iCount > 0 ? (iSum / iCount).toFixed(1) : 0;

      const invTrust = trustScores.find(t => t.interviewId === inv.mockid);
      
      return {
        mockid: inv.mockid,
        jobposition: inv.jobposition,
        difficulty: inv.difficulty,
        date: inv.createdAt,
        aiScore: iScore,
        trustScore: invTrust ? invTrust.score : 100
      }
    });

    // Real AI Insights
    let insightsProfile = await CandidateAiProfile.findOne({ userId: user._id });
    
    // Determine if we need to generate/update (if missing or older than latest interview)
    let needsUpdate = false;
    if (!insightsProfile) {
      needsUpdate = true;
    } else if (interviews.length > 0) {
      const latestInterviewDate = new Date(interviews[0].createdAt);
      if (new Date(insightsProfile.lastUpdated) < latestInterviewDate) {
        needsUpdate = true;
      }
    }

    if (needsUpdate && count > 0) {
      try {
        let userSkills = [];
        try {
          userSkills = typeof user.skills === 'string' ? user.skills.split(',').map(s => s.trim()) : (user.skills || []);
        } catch (e) {
          userSkills = [user.skills];
        }

        const generatedInsights = await aiService.generateCandidateInsights(aiScore, trustScore, userSkills, req.user._id);
        
        insightsProfile = await CandidateAiProfile.findOneAndUpdate(
          { userId: user._id },
          { 
            summary: generatedInsights.summary,
            strengths: generatedInsights.strengths,
            weaknesses: generatedInsights.weaknesses,
            recommendedRoles: generatedInsights.recommendedRoles,
            matchScore: aiScore * 10,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error('Failed to generate real AI insights:', err);
      }
    }

    const insights = insightsProfile ? {
      summary: insightsProfile.summary,
      strengths: insightsProfile.strengths,
      weaknesses: insightsProfile.weaknesses,
      recommendedRoles: insightsProfile.recommendedRoles
    } : {
      summary: "AI analysis pending or unavailable.",
      strengths: [],
      weaknesses: [],
      recommendedRoles: []
    };

    res.json({
      success: true,
      data: {
        user,
        scores: {
          overall: aiScore,
          technical: technicalScore,
          communication: communicationScore,
          problemSolving: problemSolvingScore,
          trust: trustScore
        },
        recommendation: getRecommendation(trustScore, aiScore),
        interviewsCompleted: interviews.length,
        history,
        insights,
        totalViolations: violations.length
      }
  });
});

exports.getReports = catchAsync(async (req, res, next) => {
    res.json({ success: true, data: [] });
});

exports.getAnalytics = catchAsync(async (req, res, next) => {
    const summary = await analyticsService.getRecruiterSummary(req.user.email);
    res.json({
      success: true,
      data: summary
    });
});
