const express = require('express');
const router = express.Router();
const {
    getAllLeads,
    getAllContacts,
    advanced,
    summary,
    recentActivities
} = require('../Analytics/analytics_controller');
const verifyToken = require('../Configuration/auth');

router.get('/leads', verifyToken, getAllLeads);
router.get('/contacts', verifyToken, getAllContacts);
router.get('/advanced', verifyToken, advanced);
router.get('/summary', verifyToken, summary);
router.get('/recent-activities', verifyToken, recentActivities);

module.exports = router;