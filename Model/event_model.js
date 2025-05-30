const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  description: { type: String },
  createdBy: {
    type: String,
    required: true
  },
  notify: { 
    type: Boolean, 
    default: false 
  },
  reminderTime: { 
    type: Number, 
    default: 5 // minutes
  }
},
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);