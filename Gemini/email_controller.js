const axios = require('axios');
const nodemailer = require('nodemailer');
const { logSentEmails } = require('../Controller/emailLog_controller'); // Import the logging function

const generateEmail = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await axios.post(
      endpoint,
      {
        contents: [
          {
            parts: [{ text: `Imagine that you are a person from a company and sending mail to your client. Write a professional email, do not give options give only one email body : ${prompt}` }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    return res.status(200).json({ content });
  } catch (error) {
    console.error("❌ Error during Gemini generation:", error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to generate email', error: error.message });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ message: 'To, subject, and body are required' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      subject,
      text: body,
    };

    if (Array.isArray(to)) {
      // bulk email
      const emailPromises = to.map(email => {
        return new Promise((resolve, reject) => {
          transporter.sendMail({ ...mailOptions, to: email }, (error, info) => {
            if (error) {
              console.error("❌ Error sending to:", email, "-", error.message);
              return reject({ email, error: error.message });
            }
            resolve({ email, info });
          });
        });
      });

      const results = await Promise.allSettled(emailPromises);

      await logSentEmails({ to, subject, body, sentBy: req.user.email });

      const success = results.filter(r => r.status === 'fulfilled');
      const failure = results.filter(r => r.status === 'rejected');

      return res.status(200).json({
        message: 'Bulk email processed',
        success: success.length,
        failed: failure.length,
        details: { success, failure },
      });
    } else {
      // single email
      const info = await transporter.sendMail({ ...mailOptions, to });
      await logSentEmails({ to, subject, body, sentBy: req.user.email });
      return res.status(200).json({ message: 'Email sent successfully', info });
    }
  } catch (error) {
    console.error("❌ Error in handleSendEmail:", error.message);
    return res.status(500).json({ message: 'Email sending failed', error: error.message });
  }
};

module.exports = { generateEmail, sendEmail };