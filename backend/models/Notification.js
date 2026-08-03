const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recruiterEmail: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'],
    default: 'INFO',
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
