const mongoose = require('mongoose');

const aiRequestLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Could be null if failed before auth or system task
  },
  requestType: {
    type: String, // e.g., 'GENERATE_QUESTIONS', 'ANALYZE_ANSWER'
    required: true,
  },
  provider: {
    type: String, // e.g., 'gemini', 'openai'
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
  },
  responseTime: {
    type: Number, // milliseconds
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('AIRequestLog', aiRequestLogSchema);
