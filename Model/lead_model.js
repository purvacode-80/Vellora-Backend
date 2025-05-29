const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: Number, required: true },
  industry: {
    type: String,
    enum: ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Real Estate'],
    default: 'Technology'
  },
  leadSource: {
    type: String,
    enum: ['Referral', 'Website', 'Cold Call', 'Social Media', 'Email Campaign', 'Trade Show', 'Other'],
    default: 'Referral'
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Converted', 'Closed'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  lastContacted: Date,
  nextActionDate: Date,
  notes: String,
  createdBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
