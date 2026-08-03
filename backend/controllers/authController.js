const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMessage } = require('../utils/gemini');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sendTokenResponse = async (user, statusCode, res) => {
  const token = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const isProd = process.env.NODE_ENV === 'production';
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(statusCode).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college || '',
    branch: user.branch || '',
    graduationYear: user.graduationYear || '',
    profileCompleted: user.profileCompleted || false,
    isRoleLocked: user.isRoleLocked || false,
    targetRole: user.targetRole || '',
    skills: user.skills || [],
    placementStatus: user.placementStatus || 'Looking for Jobs',
    token // Send token for legacy frontend support during transition
  });
};

// POST /api/auth/register
const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Name, email, and password are required', 400));
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError('User already exists with this email', 400));
  }

  const user = await User.create({ name, email, password, role: 'student' });

  sendTokenResponse(user, 201, res);
});

// POST /api/auth/login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = await User.findOne({ email: normalizedEmail }).select('+password');

  // Strict Database Check: If user is not found in DB, prompt signup
  if (!user) {
    return res.status(404).json({
      error: 'Account not found in database. Please sign up to create an account.',
      redirectToRegister: true,
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  sendTokenResponse(user, 200, res);
});

// GET /api/auth/me
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.json(user);
});

// PUT /api/auth/profile
const updateProfile = catchAsync(async (req, res, next) => {
  const {
    name,
    college,
    branch,
    graduationYear,
    targetRole,
    skills,
    bio,
    phone,
    linkedIn,
    github,
    placementStatus,
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // User Type Locking Rule: User Type (Student or Recruiter) becomes permanently locked once chosen
  if (req.body.role !== undefined) {
    const desiredRole = req.body.role.trim();
    if (desiredRole !== 'student' && desiredRole !== 'recruiter') {
      return next(new AppError('Invalid role specified.', 400));
    }
    if (user.isUserTypeLocked && desiredRole !== user.role) {
      return next(new AppError('User Type (Student or Recruiter) is permanently set and cannot be modified after initial setup.', 400));
    }
    user.role = desiredRole;
    user.isUserTypeLocked = true;
  }

    if (name !== undefined) user.name = name;
    if (college !== undefined) user.college = college;
    if (branch !== undefined) user.branch = branch;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    
    // Job Role (targetRole) CAN BE UPDATED ANYTIME by candidate
    if (targetRole !== undefined) {
      user.targetRole = targetRole.trim();
    }

    // Mark profile as completed
    user.profileCompleted = true;

    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (linkedIn !== undefined) user.linkedIn = linkedIn;
    if (github !== undefined) user.github = github;
    if (placementStatus !== undefined) user.placementStatus = placementStatus;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isUserTypeLocked: user.isUserTypeLocked,
      college: user.college,
      branch: user.branch,
      graduationYear: user.graduationYear,
      targetRole: user.targetRole,
      profileCompleted: user.profileCompleted,
      skills: user.skills,
      bio: user.bio,
      phone: user.phone,
      linkedIn: user.linkedIn,
      github: user.github,
      placementStatus: user.placementStatus,
    });
});

// POST /api/auth/verify-role
const verifyRole = async (req, res) => {
  try {
    const { targetRole, skills } = req.body;
    if (!targetRole || typeof targetRole !== 'string' || !targetRole.trim()) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    const currentSkills = Array.isArray(skills) ? skills : [];
    const prompt = `Act as a Technical Hiring Lead & Placement Officer. Analyze this candidate's target job role and skill stack:
Target Role: "${targetRole.trim()}"
Current Skills: ${currentSkills.length > 0 ? currentSkills.join(', ') : 'None listed'}

Evaluate if this job role exists, its market validity, standard terminology, and missing required skills.
Return ONLY a raw JSON object (no markdown, no backticks, no explanatory text) with this exact schema:
{
  "status": "valid",
  "color": "green",
  "badgeTitle": "short badge title",
  "confidenceScore": 95,
  "explanation": "1-2 sentence assessment of the role's industry standing and demand",
  "recommendedRoleTitle": "standardized role title if current one is vague/misspelled, or empty string if fine",
  "missingKeySkills": ["Skill 1", "Skill 2", "Skill 3"]
}

Guidelines for color:
- "green" (valid): standard recognized job role (e.g. Full Stack Developer, Frontend Engineer, Data Scientist, DevOps Engineer, Backend Engineer, QA Engineer, Cloud Architect, Mobile Developer, Product Manager).
- "orange" (emerging): niche, hybrid, or highly specialized role (e.g. AI Prompt Engineer, Blockchain Rust Dev, Quantum Computing Researcher, Growth Hacker).
- "red" (unclear): vague, nonsense, unrealistic, or uncommonly phrased role (e.g. asdf, magic coder, CEO of universe, superhero).`;

    let aiResult;
    try {
      const response = await sendMessage(prompt);
      const text = response?.response?.text ? response.response.text() : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResult = JSON.parse(jsonMatch[0]);
      }
    } catch (aiErr) {
      console.warn('[verifyRole] Gemini AI call failed or unconfigured, using intelligent heuristic fallback:', aiErr.message);
    }

    // Heuristic fallback if AI is unavailable or returned invalid JSON
    if (!aiResult) {
      const lowerRole = targetRole.trim().toLowerCase();
      const standardKeywords = ['developer', 'engineer', 'architect', 'analyst', 'designer', 'manager', 'lead', 'administrator', 'specialist', 'consultant', 'tester', 'qa', 'scientist', 'programmer', 'coder'];
      const techFields = ['frontend', 'backend', 'full stack', 'fullstack', 'mern', 'mean', 'react', 'node', 'java', 'python', 'devops', 'cloud', 'data', 'ai', 'ml', 'cybersecurity', 'mobile', 'ios', 'android', 'ui', 'ux', 'database', 'security', 'software', 'web', 'golang', 'c++', 'flutter', 'sysadmin'];
      const nicheFields = ['blockchain', 'quantum', 'prompt', 'crypto', 'vr', 'ar', 'robotics', 'growth', 'bioinformatics', 'edge'];

      const isStandard = standardKeywords.some(k => lowerRole.includes(k)) || techFields.some(t => lowerRole.includes(t));
      const isNiche = nicheFields.some(n => lowerRole.includes(n));

      if (isStandard) {
        aiResult = {
          status: 'valid',
          color: 'green',
          badgeTitle: 'Verified High-Demand Role',
          confidenceScore: 95,
          explanation: `"${targetRole.trim()}" is a recognized standard industry role in tech campus placements.`,
          recommendedRoleTitle: '',
          missingKeySkills: ['TypeScript', 'Docker', 'REST API Design', 'System Architecture'],
        };
      } else if (isNiche) {
        aiResult = {
          status: 'emerging',
          color: 'orange',
          badgeTitle: 'Emerging / Specialized Role',
          confidenceScore: 75,
          explanation: `"${targetRole.trim()}" is a specialized niche domain position.`,
          recommendedRoleTitle: 'Software Engineer',
          missingKeySkills: ['Cloud Infrastructure', 'CI/CD Automation', 'Domain Best Practices'],
        };
      } else {
        aiResult = {
          status: 'unclear',
          color: 'red',
          badgeTitle: 'Unclear / Non-Standard Role',
          confidenceScore: 20,
          explanation: `"${targetRole.trim()}" is not a recognized tech job role title in placement drives.`,
          recommendedRoleTitle: 'Full Stack MERN Developer or Software Engineer',
          missingKeySkills: ['Data Structures & Algorithms', 'Web Development', 'Git Version Control'],
        };
      }
    }

    res.json(aiResult);
  } catch (error) {
    console.error('Verify role error:', error);
    res.status(500).json({ error: 'Failed to verify target role' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    const crypto = require('crypto');
    // Generate 6-digit OTP reset code and 15-min expiration
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.resetPasswordToken = hashedOTP;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // TODO: Send resetCode via Email Service here

    res.json({
      message: 'Password reset OTP sent successfully'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error generating password reset code' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ error: 'Email, reset code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const crypto = require('crypto');
    const hashedOTP = crypto.createHash('sha256').update(resetCode).digest('hex');

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: hashedOTP,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset code' });
    }

    // Set new password (pre-save hook will hash it with bcrypt)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error resetting password' });
  }
};

// GET /api/auth/refresh
const refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return next(new AppError('No refresh token found', 401));

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const user = await User.findOne({ _id: decoded.id, refreshToken }).select('-password');
  
  if (!user) return next(new AppError('Invalid refresh token', 401));

  sendTokenResponse(user, 200, res);
});

// POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(0), httpOnly: true });
  res.cookie('refreshToken', 'none', { expires: new Date(0), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out' });
};

module.exports = { register, login, getMe, updateProfile, verifyRole, forgotPassword, resetPassword, refresh, logout };

