const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interviewId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  candidateName: {
    type: String,
    required: true,
  },
  interviewTitle: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Completed', 'Passed', 'Failed'],
    default: 'Completed'
  },
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
