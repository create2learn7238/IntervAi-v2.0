const Interview = require('../models/Interview');
const TrustScore = require('../models/TrustScore');
const UserAnswer = require('../models/UserAnswer');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const CandidateAiProfile = require('../models/CandidateAiProfile');

const getRecommendation = (trustScore, aiScore) => {
  if (trustScore < 60) return 'Reject';
  if (trustScore >= 80 && aiScore >= 7) return 'Hire';
  return 'Consider';
};

exports.getRecommendation = getRecommendation;

exports.getRecruiterSummary = async (recruiterEmail) => {
  // Use aggregation to fetch interviews and their trust scores
  const interviews = await Interview.aggregate([
    { $match: { status: 'Completed' } },
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

  // Completion Trend (Last 7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const dailyInterviewsAgg = await Interview.aggregate([
    { $match: { status: 'Completed', createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%m/%d", date: "$createdAt" } },
        completed: { $sum: 1 }
      }
    }
  ]);

  const completionTrend = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    const aggDateStr = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    
    const interviewData = dailyInterviewsAgg.find(item => item._id === aggDateStr);
    completionTrend.push({ name: dateStr, completed: interviewData ? interviewData.completed : 0 });
  }

  // Skill Performance (Extract from users who took these interviews)
  const candidateEmails = [...new Set(interviews.map(i => i.createdby).filter(Boolean))];
  const users = await User.find({ email: { $in: candidateEmails } });
  
  const skillCount = {};
  users.forEach(u => {
    if (u.skills) {
      let userSkills = [];
      try {
        // Handle skills if it's stored as JSON string or comma separated
        userSkills = Array.isArray(u.skills) ? u.skills : u.skills.split(',').map(s => s.trim());
      } catch (e) {
        userSkills = [u.skills];
      }
      userSkills.forEach(s => {
        if (s) skillCount[s] = (skillCount[s] || 0) + 1;
      });
    }
  });

  const skillPerformance = Object.keys(skillCount)
    .map(k => ({ skill: k, score: skillCount[k] * 10 })) // Arbitrary multiplier for display purposes if just counting
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 skills

  if (skillPerformance.length === 0) {
    skillPerformance.push({ skill: 'No Data', score: 0 });
  }

  return {
    trustScoreDistribution,
    completionTrend,
    hiringRecBreakdown,
    positionDist,
    skillPerformance
  };
};

exports.getCandidateSummary = async (userEmail, userId) => {
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

  // Generate Dynamic Recommendations
  let recommendations = [];
  if (userId) {
    const aiProfile = await CandidateAiProfile.findOne({ userId });
    if (aiProfile && aiProfile.weaknesses && aiProfile.weaknesses.length > 0) {
      recommendations = aiProfile.weaknesses.slice(0, 3).map((weakness, i) => ({
        title: `Improvement Area ${i + 1}`,
        desc: weakness,
        tag: 'AI Insight',
      }));
    }
  }

  // Fallback if no AI Profile exists yet
  if (recommendations.length === 0 && answers.length > 0) {
    const sortedAnswers = [...answers].sort((a, b) => parseFloat(a.rating) - parseFloat(b.rating));
    recommendations = sortedAnswers.slice(0, 3).map((ans) => ({
      title: 'Review Question',
      desc: ans.feedback ? ans.feedback.substring(0, 100) + '...' : `Practice your response to: "${ans.question}"`,
      tag: 'Practice',
    }));
  }

  // Final fallback if brand new user
  if (recommendations.length === 0) {
    recommendations = [
      {
        title: 'Start Your First Interview',
        desc: 'Complete a mock session to generate your first AI personalized insights.',
        tag: 'Getting Started'
      }
    ];
  }
  
  return {
    averageScore,
    totalAnswers,
    trustScoreTrend,
    recommendations
  };
};

exports.getAdminSummary = async () => {
  const [totalUsers, totalInterviews, totalCertificates, trustScores] = await Promise.all([
    User.countDocuments(),
    Interview.countDocuments(),
    Certificate.countDocuments(),
    TrustScore.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }])
  ]);

  const averageTrustScore = trustScores[0] ? parseFloat(trustScores[0].avg.toFixed(1)) : 100;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyInterviewsAgg = await Interview.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%m/%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    }
  ]);

  const userGrowthAgg = await User.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%m/%d", date: "$createdAt" } },
        users: { $sum: 1 }
      }
    }
  ]);

  const dailyInterviews = [];
  const userGrowth = [];
  
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    const aggDateStr = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    
    const interviewData = dailyInterviewsAgg.find(item => item._id === aggDateStr);
    dailyInterviews.push({ date: dateStr, count: interviewData ? interviewData.count : 0 });

    const userData = userGrowthAgg.find(item => item._id === aggDateStr);
    userGrowth.push({ date: dateStr, users: userData ? userData.users : 0 });
  }

  return { 
    totalUsers,
    totalInterviews,
    averageTrustScore,
    totalCertificates,
    dailyInterviews,
    userGrowth
  };
};

exports.getPlatformSummary = async () => {
  const [totalUsers, totalInterviews] = await Promise.all([
    User.countDocuments(),
    Interview.countDocuments()
  ]);

  return {
    totalUsers,
    totalInterviews
  };
};
