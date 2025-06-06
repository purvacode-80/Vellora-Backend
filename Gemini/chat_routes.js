// routes/chat_routes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../Configuration/auth");
const { getChatHistory } = require("../Gemini/chat_controller");
const { chatWithGemini } = require("../Gemini/chatbot_controller");

router.get("/history", verifyToken, getChatHistory);
router.post("/chatbot", verifyToken, chatWithGemini); // Your existing Gemini handler

module.exports = router;