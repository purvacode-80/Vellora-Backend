// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendWelcomeEmail = async (recipientEmail, recipientName) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: 'purvaw06@gmail.com',
      pass: 'watl gzku nerq ikeb',
    },
  });

  const mailOptions = {
    from: `"CRM Team" <${process.env.SMTP_EMAIL}>`,
    to: recipientEmail,
    subject: "Welcome to Our CRM System!",
    html: `<p>Dear ${recipientName || "Lead"},</p>
           <p>Thank you for joining our CRM. We'll be in touch with you soon!</p>
           <p>Regards,<br/>CRM Team</p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("✅ Email sent:", info.response);
};

module.exports = sendWelcomeEmail;
