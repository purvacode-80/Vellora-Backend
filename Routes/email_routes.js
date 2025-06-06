const express = require('express');
const router = express.Router();
const EmailLog = require('../Model/email_model');
const verifyToken = require('../Configuration/auth');

router.get('/count-email', verifyToken, async (req, res) => {
  const { range } = req.query; // e.g., ?range=7 or 30 or 365

  const days = parseInt(range || 30); // default to 30 days if not provided

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  try {
    const count = await EmailLog.countDocuments({
      sentBy: req.user.email,
      sentAt: { $gte: fromDate },
    });

    res.status(200).json({ count, range: days });
  } catch (err) {
    console.error("❌ Email count error:", err.message);
    res.status(500).json({ message: "Failed to fetch email count", error: err.message });
  }
});

module.exports = router;
