const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskname: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  duedate: {
    type: Date,
    required: true
  },
  contact: {
    type: Number,
    required: true
  },
  assignedto: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Started', 'Not Started', 'Pending', 'In Progress', 'Completed'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  assigneddate: {
    type: Date,
    default: Date.now
  },
  userEmail: {
    type: String,
    required: true  // 👈 Ensure this is always saved with the task
  }
});

module.exports = mongoose.model('Task', taskSchema);
