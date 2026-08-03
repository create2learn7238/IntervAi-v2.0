const Certificate = require('../models/Certificate');
const Interview = require('../models/Interview');
const TrustScore = require('../models/TrustScore');
const { v4: uuidv4 } = require('uuid');

exports.generateCertificate = async (req, res) => {
  try {
    const { interviewId } = req.body;
    
    // Check if already exists
    let cert = await Certificate.findOne({ interviewId });
    if (cert) return res.json({ success: true, data: cert });

    const interview = await Interview.findOne({ mockid: interviewId });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (interview.createdby !== req.user.email) return res.status(403).json({ error: 'Unauthorized access to this interview data' });
    
    const trust = await TrustScore.findOne({ interviewId });
    const score = trust ? trust.score : 100;
    const status = score >= 50 ? 'Passed' : 'Failed';

    cert = await Certificate.create({
      userId: req.user._id,
      interviewId,
      candidateName: req.user.name,
      interviewTitle: interview.jobposition,
      score,
      status,
      certificateId: `CERT-${uuidv4().substring(0, 8).toUpperCase()}`
    });

    res.status(201).json({ success: true, data: cert });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

exports.getCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certId });
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    res.json({ success: true, data: cert });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
};

exports.getUserCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: certs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user certificates' });
  }
};
