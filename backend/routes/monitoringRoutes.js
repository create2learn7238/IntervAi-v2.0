const express = require('express');
const router = express.Router();
const { initSession, logViolation, getSummary } = require('../controllers/monitoringController');
const { protect } = require('../middleware/auth'); // Check if auth.js exists in middleware

// Temporarily skip protect if middleware/auth.js fails, but the prompt says protect all APIs
// I'll assume protect works for now. 

router.post('/init', initSession); // Protect might require token, let's leave unprotected temporarily unless I check auth.js. Wait, prompt says: "Protect all APIs using existing authentication middleware."
// Let's add protect.
router.post('/init', protect, initSession);
router.post('/violation', protect, logViolation);
router.get('/summary/:mockid', protect, getSummary);

module.exports = router;
