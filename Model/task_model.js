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
    type: String,
    required: true
  },
  assignedto: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Not Started', 'Deferred', 'In Progress', 'Completed'],
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
  createdBy: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Task', taskSchema);
