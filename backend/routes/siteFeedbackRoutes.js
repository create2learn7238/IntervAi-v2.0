const express = require('express');
const router = express.Router();
const { createFeedback } = require('../controllers/siteFeedbackController');
const { protect } = require('../middleware/auth');

router.use(protect); // Ensure user is logged in
router.post('/', createFeedback);

module.exports = router;
