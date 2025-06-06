// models/chat_model.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user: { type: String, required: true }, // User's email
  messages: [
    {
      sender: { type: String, enum: ['user', 'bot'], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("ChatBot", messageSchema);