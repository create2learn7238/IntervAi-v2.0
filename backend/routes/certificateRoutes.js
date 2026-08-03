const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateCertificate, getCertificate, getUserCertificates } = require('../controllers/certificateController');

router.post('/generate', protect, generateCertificate);
router.get('/my-certificates', protect, getUserCertificates);
router.get('/:certId', protect, getCertificate);

module.exports = router;
