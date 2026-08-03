const TrustScore = require('../models/TrustScore');
const Violation = require('../models/Violation');

// Points configuration for each violation type
const PENALTY_MAP = {
  FULLSCREEN_EXIT: 5,
  TAB_SWITCH: 5,
  WINDOW_HIDDEN: 5,
  CAMERA_OFF: 15,
  MIC_OFF: 10,
  BROWSER_RESIZE: 10,
  UNKNOWN: 0,
};

const SEVERITY_MAP = {
  FULLSCREEN_EXIT: 'Medium',
  TAB_SWITCH: 'Medium',
  WINDOW_HIDDEN: 'Medium',
  CAMERA_OFF: 'High',
  MIC_OFF: 'High',
  BROWSER_RESIZE: 'Low',
  UNKNOWN: 'Low',
};

exports.initializeTrustScore = async (interviewId, userEmail) => {
  let score = await TrustScore.findOne({ interviewId });
  if (!score) {
    score = await TrustScore.create({ interviewId, userEmail, score: 100 });
  }
  return score;
};

exports.logViolation = async (interviewId, userEmail, violationType, description, duration = 0) => {
  const penalty = PENALTY_MAP[violationType] || 0;

  // Use MongoDB atomic update pipeline to prevent race conditions
  const trustScore = await TrustScore.findOneAndUpdate(
    { interviewId },
    [
      { 
        $set: { 
          userEmail: userEmail,
          score: { $max: [0, { $subtract: [{ $ifNull: ["$score", 100] }, penalty] }] }
        } 
      },
      {
        $set: {
          status: {
            $switch: {
              branches: [
                { case: { $gte: ["$score", 90] }, then: 'Excellent' },
                { case: { $gte: ["$score", 75] }, then: 'Good' },
                { case: { $gte: ["$score", 50] }, then: 'Warning' }
              ],
              default: 'Critical'
            }
          },
          lastUpdated: new Date()
        }
      }
    ],
    { new: true, upsert: true }
  );

  const scoreBefore = Math.min(100, trustScore.score + penalty);

  // 2. Create violation record
  const severity = SEVERITY_MAP[violationType] || 'Low';
  const violation = await Violation.create({
    interviewId,
    userEmail,
    violationType,
    description,
    duration,
    severity,
    trustScoreBefore: scoreBefore,
    trustScoreAfter: trustScore.score,
  });

  return { violation, trustScore };
};

exports.getInterviewSummary = async (interviewId) => {
  const trustScore = await TrustScore.findOne({ interviewId });
  const violations = await Violation.find({ interviewId }).sort({ createdAt: -1 });

  return {
    trustScore: trustScore ? trustScore.score : 100,
    status: trustScore ? trustScore.status : 'Excellent',
    violations,
    violationCount: violations.length,
  };
};
