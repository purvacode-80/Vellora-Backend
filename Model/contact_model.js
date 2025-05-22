// contact_model.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: Number, required: true },
  position: String,
  company: String,
  address: String,
  notes: String,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Pending'
  },
  createdBy: { // ✅ NEW FIELD
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);