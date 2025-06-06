// controllers/chatbot_controller.js
const axios = require("axios");
const Lead = require("../Model/lead_model");
const Contact = require("../Model/contact_model");
const Task = require("../Model/task_model");
const Event = require("../Model/event_model");
const EmailLog = require("../Model/email_model");
const { saveMessage } = require("./chat_controller");

const chatWithGemini = async (req, res) => {
  const { message } = req.body;
  const userEmail = req.user.email;

  try {
    // 1. Fetch all data for the authenticated user
    const [leads, contacts, tasks, events, emails] = await Promise.all([
      Lead.find({ createdBy: userEmail }),
      Contact.find({ createdBy: userEmail }),
      Task.find({ createdBy: userEmail }),
      Event.find({ createdBy: userEmail }),
      EmailLog.find({ sentBy: userEmail }),
    ]);

    // 2. Compose context for Gemini
    const context = `
      Leads: ${JSON.stringify(leads)}
      Contacts: ${JSON.stringify(contacts)}
      Tasks: ${JSON.stringify(tasks)}
      Events: ${JSON.stringify(events)}
      Emails: ${JSON.stringify(emails)}
    `;

    // 3. Query Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await axios.post(endpoint, {
      contents: [
        {
          parts: [
            { text: `You're an intelligent CRM assistant. Use the context to answer user queries.` },
            { text: `User query: ${message}` },
            { text: `Context: ${context}` },
          ],
        },
      ],
    });

    const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a reply.";

    // Save both user and bot messages
    await saveMessage(userEmail, {
      sender: "user",
      text: message,
    });

    await saveMessage(userEmail, {
      sender: "bot",
      text: reply,
    });

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Gemini chatbot error:", err.message);
    res.status(500).json({ message: "Error generating chatbot response" });
  }
};

module.exports = { chatWithGemini };