const sgMail = require("@sendgrid/mail");

// Ensure the API_KEY is either a valid string or throw an error if undefined
const API_KEY = process.env.SENDGRID_API_KEY || ""; // Fallback to empty string if undefined
if (!API_KEY) {
  throw new Error("SENDGRID_API_KEY is not defined");
}

sgMail.setApiKey(API_KEY);

const message = {
  to: "raymondmapayo@gmail.com", // Change to your recipient
  from: "raymondmapayo@gmail.com", // Change to your verified sender
  subject: "Sending with SendGrid is Fun",
  text: "and easy to do anywhere, even with Node.js",
  html: "<strong>and easy to do anywhere, even with Node.js</strong>",
};

const sendEmail = async (message) => {
  try {
    await sgMail.send(message);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error("Response:", error.response.body);
    }
  }
};
