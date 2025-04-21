const Lead = require('../Model/lead_model');

const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving leads', error: error.message });
    }
};

const createLead = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, industry, leadSource, status, priority, lastContacted, nextActionDate, notes } = req.body;
    const leadExists = await Lead.findOne({ email })
    if(leadExists) {
        return res.status(400).json({ message : "Lead with this email already exists" })
    }

    const newLead = new Lead({ companyName, contactPerson, email, phone, industry, leadSource, status, priority, lastContacted, nextActionDate, notes });
    await newLead.save();
    res.status(201).json(newLead);
  }
  catch (error) {
    res.status(500).json({ message: 'Error creating lead', error: error.message });
  }
};

const getLeadById = async (req, res) => {
  try {
    const { leadId } = req.params;
    const lead = await Lead.findById(leadId);
      if (!lead) {
          return res.status(404).json({ message: 'Lead not found' });
      }
    res.status(200).json(lead);
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving lead', error: error.message });
    
  }
}   

module.exports = { getAllLeads, createLead, getLeadById };