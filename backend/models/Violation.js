const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  interviewId: {
    type: String,
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  violationType: {
    type: String,
    required: true,
    enum: ['FULLSCREEN_EXIT', 'TAB_SWITCH', 'WINDOW_HIDDEN', 'CAMERA_OFF', 'MIC_OFF', 'BROWSER_RESIZE', 'UNKNOWN'],
  },
  description: {
    type: String,
    default: '',
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  duration: {
    type: Number, // duration in milliseconds if applicable
    default: 0,
  },
  trustScoreBefore: {
    type: Number,
    required: true,
  },
  trustScoreAfter: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Violation', violationSchema);
