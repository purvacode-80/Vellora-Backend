const express = require('express');
const { getAllLeads, getLeadById ,createLead } = require('../Controller/lead_controller');
const validateLead = require('../Middleware/lead_validators');
const router = express.Router();

router.get('/all', getAllLeads);
router.get('/:leadId', getLeadById);
router.post('/', validateLead, createLead);

module.exports = router;