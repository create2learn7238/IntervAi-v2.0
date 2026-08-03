const Interview = require('../models/Interview');
const TrustScore = require('../models/TrustScore');
const UserAnswer = require('../models/UserAnswer');

const getRecommendation = (trustScore, aiScore) => {
  if (trustScore < 60) return 'Reject';
  if (trustScore >= 80 && aiScore >= 7) return 'Hire';
  return 'Consider';
};

exports.getRecommendation = getRecommendation;

exports.getRecruiterSummary = async (recruiterEmail) => {
  // Use aggregation to fetch interviews and their trust scores
  const interviews = await Interview.aggregate([
    { $match: { createdby: recruiterEmail } },
    {
      $lookup: {
        from: 'trustscores',
        localField: 'mockid',
        foreignField: 'interviewId',
        as: 'trust'
      }
    }
  ]);

  const mockIds = interviews.map(i => i.mockid);

  // Group user answers to calculate average AI score per interview
  const answersAgg = await UserAnswer.aggregate([
    { $match: { mockidRef: { $in: mockIds } } },
    {
      $group: {
        _id: '$mockidRef',
        avgScore: { $avg: { $toDouble: '$rating' } }
      }
    }
  ]);

  const answerScoreMap = {};
  answersAgg.forEach(a => {
    answerScoreMap[a._id] = parseFloat(a.avgScore.toFixed(1));
  });

  const recommendationCounts = { Hire: 0, Consider: 0, Reject: 0 };
  const positionCounts = {};
  const trustScoreDistribution = [];

  interviews.forEach((i, idx) => {
    positionCounts[i.jobposition] = (positionCounts[i.jobposition] || 0) + 1;
    
    const tScore = i.trust && i.trust.length > 0 ? i.trust[0].score : 100;
    const aiScore = answerScoreMap[i.mockid] || 0;
    
    const rec = getRecommendation(tScore, aiScore);
    recommendationCounts[rec]++;
    
    trustScoreDistribution.push({ name: `Cand-${idx+1}`, score: tScore });
  });

  const hiringRecBreakdown = Object.keys(recommendationCounts).map(k => ({
    name: k, count: recommendationCounts[k]
  }));

  const positionDist = Object.keys(positionCounts).map(k => ({
    position: k.length > 15 ? k.substring(0, 15) + '...' : k,
    count: positionCounts[k]
  }));

  const completionTrend = [
    { name: 'Mon', completed: 2, scheduled: 3 },
    { name: 'Tue', completed: 4, scheduled: 4 },
    { name: 'Wed', completed: 1, scheduled: 2 },
    { name: 'Thu', completed: 5, scheduled: 6 },
    { name: 'Fri', completed: 3, scheduled: 3 }
  ];

  return {
    trustScoreDistribution,
    completionTrend,
    hiringRecBreakdown,
    positionDist,
    skillPerformance: [
      { skill: 'React', score: 85 },
      { skill: 'Node.js', score: 70 },
      { skill: 'System Design', score: 60 },
      { skill: 'Communication', score: 90 }
    ]
  };
};

exports.getCandidateSummary = async (userEmail) => {
  const answers = await UserAnswer.find({ userEmail });
  
  let totalScore = 0;
  let totalAnswers = answers.length;
  
  answers.forEach(a => {
    totalScore += parseFloat(a.rating || 0);
  });
  
  const averageScore = totalAnswers > 0 ? (totalScore / totalAnswers).toFixed(1) : 0;
  
  const trustScores = await TrustScore.find({ userEmail }).sort({ createdAt: 1 });
  const trustScoreTrend = trustScores.map(ts => {
    const dateObj = new Date(ts.createdAt);
    return {
      date: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
      score: ts.score
    };
  });
  
  return {
    averageScore,
    totalAnswers,
    trustScoreTrend
  };
};

exports.getAdminSummary = async () => {
  return { message: "Admin analytics coming soon" };
};
