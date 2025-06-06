const EmailLog = require("../Model/email_model");

const logSentEmails = async ({ to, subject, body, sentBy }) => {
  const recipients = Array.isArray(to) ? to : [to];
  const logEntries = recipients.map((recipient) => ({
    to: recipient,
    subject,
    body,
    sentBy,
    sentAt: new Date(),
  }));

  try {
    await EmailLog.insertMany(logEntries);
    console.log(`📨 Logged ${logEntries.length} emails`);
  } catch (err) {
    console.error("❌ Failed to log emails:", err);
  }
};

module.exports = { logSentEmails };