const mongoose = require('mongoose');

const trustScoreSchema = new mongoose.Schema({
  interviewId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['Excellent', 'Good', 'Warning', 'Critical'],
    default: 'Excellent',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Pre-save hook to update status based on score
trustScoreSchema.pre('save', function (next) {
  if (this.score >= 90) this.status = 'Excellent';
  else if (this.score >= 75) this.status = 'Good';
  else if (this.score >= 50) this.status = 'Warning';
  else this.status = 'Critical';
  
  this.lastUpdated = Date.now();
  next();
});

trustScoreSchema.index({ userEmail: 1 });
trustScoreSchema.index({ interviewId: 1 });

module.exports = mongoose.model('TrustScore', trustScoreSchema);
