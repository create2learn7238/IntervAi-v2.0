const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'recruiter', 'admin'],
    default: 'student',
  },
  college: {
    type: String,
    default: '',
  },
  branch: {
    type: String,
    default: '',
  },
  graduationYear: {
    type: String,
    default: '',
  },
  targetRole: {
    type: String,
    default: '',
  },
  isUserTypeLocked: {
    type: Boolean,
    default: false,
  },
  isRoleLocked: {
    type: Boolean,
    default: false,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  skills: {
    type: [String],
    default: [],
  },
  bio: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  linkedIn: {
    type: String,
    default: '',
  },
  github: {
    type: String,
    default: '',
  },
  placementStatus: {
    type: String,
    enum: ['Looking for Jobs', 'Interviewing', 'Placed', 'Not Active'],
    default: 'Looking for Jobs',
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
  refreshToken: {
    type: String,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
