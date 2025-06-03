const axios = require('axios');
const nodemailer = require('nodemailer');

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

    // Integrate with nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Error sending email:", error.message);
        return res.status(500).json({ message: 'Failed to send email', error: error.message });
      }
      return res.status(200).json({ message: 'Email sent successfully', info });
    });
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};

module.exports = { generateEmail, sendEmail };