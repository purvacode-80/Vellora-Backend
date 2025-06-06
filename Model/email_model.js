const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema({
  to: {
    type: String, // one document per recipient
    required: true,
  },
  subject: String,
  body: String,
  sentBy: { type: String }, // or mongoose.Schema.Types.ObjectId
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("EmailLog", emailLogSchema);