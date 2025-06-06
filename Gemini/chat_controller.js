// controllers/chat_controller.js
const Chat = require("../Model/chat_model");

const saveMessage = async (email, message) => {
  const chat = await Chat.findOneAndUpdate(
    { user: email },
    { $push: { messages: message } },
    { upsert: true, new: true }
  );
  return chat;
};

const getChatHistory = async (req, res) => {
  try {
    const email = req.user.email;
    const chat = await Chat.findOne({ user: email });
    res.status(200).json(chat?.messages || []);
  } catch (err) {
    console.error("❌ Failed to fetch chat history:", err.message);
    res.status(500).json({ message: "Error fetching chat history" });
  }
};

module.exports = { saveMessage, getChatHistory };