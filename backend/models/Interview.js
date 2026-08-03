const mongoose = require('mongoose');

// Maps the Drizzle `mockinterview` table to a Mongoose model
const interviewSchema = new mongoose.Schema({
  mockid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  jsonmockresp: {
    type: String,
    required: true,
  },
  jobposition: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  jobdescription: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  jobexp: {
    type: String,
    required: true,
    maxlength: 255,
  },
  difficulty: {
    type: String,
    enum: ['Student/Beginner', 'Intermediate', 'Expert'],
    default: 'Intermediate',
  },
  createdby: {
    type: String,
    required: true,
    index: true,
  },
  candidateEmail: {
    type: String,
    default: '',
  },
  scheduledDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Completed',
  }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
