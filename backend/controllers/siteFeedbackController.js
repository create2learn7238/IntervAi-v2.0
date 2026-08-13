const SiteFeedback = require('../models/SiteFeedback');
const catchAsync = require('../utils/catchAsync');

exports.createFeedback = catchAsync(async (req, res, next) => {
  const { feedback, rating, needsUpgradation, upgradeDetails } = req.body;

  if (!feedback || !rating) {
    return res.status(400).json({ success: false, error: 'Feedback and rating are required' });
  }

  // Assuming protect middleware is used, req.user will be populated
  const newFeedback = await SiteFeedback.create({
    user: req.user._id,
    name: req.user.name,
    email: req.user.email,
    feedback,
    rating,
    needsUpgradation,
    upgradeDetails
  });

  res.status(201).json({
    success: true,
    data: newFeedback
  });
});
