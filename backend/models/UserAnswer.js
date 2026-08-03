const mongoose = require('mongoose');

// Maps the Drizzle `userAnswers` table to a Mongoose model
const userAnswerSchema = new mongoose.Schema({
  mockidRef: {
    type: String,
    required: true,
    index: true,
  },
  question: {
    type: String,
    required: true,
  },
  correctanswer: {
    type: String,
    default: '',
  },
  useranswer: {
    type: String,
    default: '',
  },
  feedback: {
    type: String,
    default: '',
  },
  detailedFeedback: {
    type: String,
    default: '',
  },
  rating: {
    type: String,
    default: '0',
  },
  justification: {
    type: String,
    default: '',
  },
  // Detailed AI Analysis Metrics
  confidenceScore: { type: Number, default: 0 },
  eyeContactScore: { type: Number, default: 0 },
  clarityScore: { type: Number, default: 0 },
  paceScore: { type: Number, default: 0 },
  depthScore: { type: Number, default: 0 },
  vocabularyScore: { type: Number, default: 0 },
  fillerWordsCount: { type: Number, default: 0 },
  // Anti-Cheating Monitoring Log
  cheatEvents: {
    copyPasteCount: { type: Number, default: 0 },
    tabSwitchCount: { type: Number, default: 0 },
    multipleFacesDetected: { type: Boolean, default: false },
    extraDeviceDetected: { type: Boolean, default: false },
    lookingAwayCount: { type: Number, default: 0 },
    noFaceCount: { type: Number, default: 0 },
  },
  // Temporary Video Recording (Auto-destroyed after 1 hour / 3600 seconds)
  videoBlobUrl: { type: String, default: '' },
  // Temporary Video Recording Marker (Does not auto-delete the document anymore, only flags it for optional cleanup)
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour flag
  },
  userEmail: {
    type: String,
    default: '',
  },
}, { timestamps: true });

userAnswerSchema.index({ userEmail: 1 });

module.exports = mongoose.model('UserAnswer', userAnswerSchema);
