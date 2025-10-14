const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD, // must be Gmail App Password
  },
  tls: {
    rejectUnauthorized: false, // needed for cloud servers
  },
});

const sendResetEmail = (user, resetUrl) => {
  const mailOptions = {
    from: `"JGAA Thai Restaurant" <${process.env.SMTP_EMAIL}>`,
    to: user.email,
    subject: "Reset your password",
    html: `
      <p>Hello ${user.fname},</p>
      <p>You requested a password reset. Click the link below:</p>
      <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
    `,
  };

  // ✅ Return a Promise
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending reset email:", err);
        return reject(err);
      }
      console.log("Reset email sent:", info.response);
      resolve(info);
    });
  });
};

module.exports = { sendResetEmail };
