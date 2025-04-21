const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  industry: String,
  leadSource: String,
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
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);