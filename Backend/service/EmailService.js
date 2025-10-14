// service/EmailService.js
const sgMail = require("@sendgrid/mail");

// 🧠 Add these two lines here
console.log("SENDGRID_API_KEY exists:", !!process.env.SENDGRID_API_KEY);
console.log("SMTP_EMAIL:", process.env.SMTP_EMAIL);

// Set SendGrid API key with validation
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (!sendgridApiKey) {
  throw new Error("SENDGRID_API_KEY is not defined in environment variables");
}
sgMail.setApiKey(sendgridApiKey);

const smtpEmail = process.env.SMTP_EMAIL;
if (!smtpEmail) {
  throw new Error("SMTP_EMAIL is not defined in environment variables");
}

// Function to send the email verification - returns a promise that resolves to boolean
const sendConfirmationEmail = (user) => {
  return new Promise((resolve) => {
    const verificationUrl = `https://jgaa-projects.vercel.app/verify-email/${user.verification_token}`;

    const msg = {
      from: smtpEmail,
      to: user.email,
      subject: "Please Verify Your Email Address",
      text: `Click the following link to verify your email address: ${verificationUrl}`,
      html: `
        <p>Good day Sir!</p>
        <p>This is <b>Jgaa Thai Restaurant</b>. Please <b>Click</b> the following link to verify your email address:</p>
        <b>This link expires in 7 days</b>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <footer>
          <p>This email was sent to: <b>${user.email}</b> for protecting the security of your account. Please make sure to verify your email to complete your registration.</p>
          <p>Thank you for registering with us.</p>
        </footer>
      `,
    };

    // Send the email using SendGrid
    sgMail
      .send(msg)
      .then(() => {
        console.log("Verification email sent via SendGrid");
        resolve(true);
      })
      .catch((err) => {
        console.error("Error sending email via SendGrid:", err);
        resolve(false);
      });
  });
};

module.exports = { sendConfirmationEmail };
