const { v4: uuidv4 } = require('uuid');
const Interview = require('../models/Interview');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// GET /api/interviews
const getInterviews = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const interviews = await Interview.find({ createdby: req.user.email })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    const totalCount = await Interview.countDocuments({ createdby: req.user.email });

    res.json({
      data: interviews,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount
    });
});

// GET /api/interviews/:mockid
const getInterview = catchAsync(async (req, res, next) => {
    const interview = await Interview.findOne({ mockid: req.params.mockid });
    if (!interview) return next(new AppError('Interview not found', 404));
    if (interview.createdby !== req.user.email && req.user.role !== 'admin') return next(new AppError('Unauthorized access', 403));
    res.json(interview);
});

// POST /api/interviews — generate questions with Gemini and save
const createInterview = catchAsync(async (req, res, next) => {
    const { jobposition, jobdescription, jobdesc, jobexp, difficulty } = req.body;
    const authorEmail = req.user.email;
    const effectiveJobDesc = jobdescription || jobdesc || 'Technical & Behavioral Mock Interview';

    if (!jobposition || !jobposition.trim()) {
      return next(new AppError('Job position is required', 400));
    }

    let jsonmockresp = null;

    // Attempt Gemini AI generation with randomized seed prompt
    try {
      const aiPersona = req.user.preferences?.aiPersona || 'Strict Recruiter';
      jsonmockresp = await aiService.generateInterviewQuestions(jobposition, effectiveJobDesc, jobexp, difficulty, aiPersona, req.user._id);
    } catch (aiErr) {
      console.warn('Gemini AI error during question generation, falling back to predefined questions:', aiErr.message);
      
      const fallbackQuestions = [
        {
          "question": "Can you describe a time when you had to learn a new technology or framework quickly? How did you approach it?",
          "answer": "Candidate should explain their learning process, utilizing documentation, building small prototypes, and applying it to the problem."
        },
        {
          "question": "How do you ensure your code is maintainable, readable, and scalable for other developers?",
          "answer": "Looking for mentions of clean code principles, DRY, SOLID, writing unit tests, and thorough documentation."
        },
        {
          "question": "Tell me about a time you disagreed with a team member on a technical decision. How did you resolve it?",
          "answer": "Candidate should demonstrate emotional intelligence, active listening, backing arguments with data, and willingness to compromise."
        },
        {
          "question": "What is the most complex bug you've ever had to track down, and what was your debugging process?",
          "answer": "Looking for a systematic approach: reproducing the issue, isolating components, checking logs, and writing a regression test."
        },
        {
          "question": "Explain a fundamental architectural pattern you frequently use (e.g., MVC, Microservices) and its trade-offs.",
          "answer": "Candidate should demonstrate deep understanding of the chosen pattern, including both its benefits and its limitations or overhead."
        }
      ];
      
      jsonmockresp = JSON.stringify(fallbackQuestions);
    }

    if (!jsonmockresp) {
      return next(new AppError('Failed to generate interview questions and fallback failed.', 500));
    }

    const mockid = uuidv4();
    const interview = await Interview.create({
      mockid,
      jsonmockresp,
      jobposition,
      jobdescription: effectiveJobDesc,
      jobexp: String(jobexp || '1'),
      difficulty: difficulty || 'Intermediate',
      createdby: authorEmail,
    });

    res.status(201).json(interview);
});

// POST /api/interviews/send-email-report
const sendEmailReport = catchAsync(async (req, res, next) => {
    const recipient = req.user.email;
    const previewUrl = await emailService.sendInterviewReport(recipient, req.body);

    res.json({
      success: true,
      message: `Interview feedback report successfully sent to ${recipient}`,
      previewUrl: previewUrl || null,
    });
});

// POST /api/interviews/:mockid/video — upload full session video
const uploadSessionVideo = catchAsync(async (req, res, next) => {
    const { mockid } = req.params;
    const interview = await Interview.findOne({ mockid });
    
    if (!interview) return next(new AppError('Interview not found', 404));
    if (interview.createdby !== req.user.email) return next(new AppError('Unauthorized access', 403));

    const videoBlobUrl = req.file ? `/api/v1/media/${req.file.filename}` : '';
    if (videoBlobUrl) {
      interview.sessionVideoUrl = videoBlobUrl;
      await interview.save();
    }

    res.json({
      success: true,
      sessionVideoUrl: videoBlobUrl
    });
});

module.exports = { getInterviews, getInterview, createInterview, sendEmailReport, uploadSessionVideo };
