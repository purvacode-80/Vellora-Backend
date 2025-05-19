const Lead = require('../Model/lead_model');

const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ createdBy: req.user.email });
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leads', error: error.message });
  }
};

const createLead = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, industry, leadSource, status, priority, lastContacted, nextActionDate, notes } = req.body;
    const leadExists = await Lead.findOne({ email });
    if (leadExists) {
      return res.status(400).json({ message: "Lead with this email already exists" });
    }

    const newLead = new Lead({
      companyName,
      contactPerson,
      email,
      phone,
      industry,
      leadSource,
      status,
      priority,
      lastContacted,
      nextActionDate,
      notes,
      createdBy: req.user.email // 👈 Store who created it
    });

    await newLead.save();
    res.status(201).json(newLead);
    // console.log("REQ.USER:", req.user);

  } catch (error) {
    res.status(500).json({ message: 'Error creating lead', error: error.message });

  }
};

const getLeadById = async (req, res) => {
  try {
    const { leadId } = req.params;
    const lead = await Lead.findOne({ _id: leadId, createdBy: req.user.email });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found or not authorized' });
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving lead', error: error.message });
  }
};

const updateLead = async (req, res) => {
  try {
    const _id = req.params._id;
    const updatedData = req.body;

    const updatedUser = await Lead.findOneAndUpdate(
      { _id, createdBy: req.user.email }, // ✅ Match by user
      updatedData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Lead not found or not authorized to update' });
    }

    res.status(200).send({ message: "Lead updated successfully", updatedUser });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const deletedLead = await Lead.findOneAndDelete({ _id: leadId, createdBy: req.user.email });
    if (!deletedLead) {
      return res.status(404).json({ message: 'Lead not found or not authorized to delete' });
    }
    res.status(200).json({ message: 'Lead deleted successfully' });
  }
  catch (error) {
    res.status(500).json({ message: 'Error deleting lead', error: error.message });
  }
}

module.exports = { getAllLeads, createLead, getLeadById, updateLead, deleteLead };
