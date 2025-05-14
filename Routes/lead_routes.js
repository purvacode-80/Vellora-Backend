const express = require('express');
const {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead
} = require('../Controller/lead_controller');
const validateLead = require('../Middleware/lead_validators');
const authMiddleware = require('../Configuration/auth'); // 👈 Your authentication middleware

const router = express.Router();

router.use(authMiddleware); // ✅ Apply to all lead routes

router.get('/all', getAllLeads);
router.get('/:leadId', getLeadById);
router.post('/', validateLead, createLead);
router.put('/editlead/:_id', updateLead);

module.exports = router;
