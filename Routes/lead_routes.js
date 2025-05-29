const express = require('express');
const {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLead
} = require('../Controller/lead_controller');
const validateLead = require('../Middleware/lead_validators');
const authMiddleware = require('../Configuration/auth');
const verifyToken = require('../Configuration/auth');

const router = express.Router();

// router.use(authMiddleware); // ✅ Apply to all lead routes

router.get('/all', verifyToken, getAllLeads);
router.get('/:leadId',verifyToken, getLeadById);
router.post('/',verifyToken, validateLead, createLead);
router.put('/editlead/:_id',verifyToken, updateLead);
router.delete('/deletelead/:leadId',verifyToken, deleteLead);
router.get('/convert-lead/:leadId', verifyToken, convertLead);

module.exports = router;
