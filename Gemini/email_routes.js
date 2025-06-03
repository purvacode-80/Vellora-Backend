const express = require('express');
const router = express.Router();
const verifyToken = require('../Configuration/auth');
const { generateEmail, sendEmail } = require('../Gemini/email_controller');

router.post('/generate-email', verifyToken, generateEmail);
router.post('/send-email', verifyToken, sendEmail);

module.exports = router;