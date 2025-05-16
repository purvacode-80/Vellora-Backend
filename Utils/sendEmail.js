const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (toEmail, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'purvaw06@gmail.com', // your Gmail
        pass: 'watl gzku nerq ikeb', // your App Password
      },
    });

    const mailOptions = {
      from: 'purvaw06@gmail.com',
      to: toEmail,
      subject: 'Welcome to Vellora CRM',
      text: `Hi ${name},\n\nThank you for joining Vellora CRM. We’re happy to have you onboard!\n\nBest regards,\nVellora Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${toEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send email: ${error.message}`);
  }
};

module.exports = sendWelcomeEmail;
