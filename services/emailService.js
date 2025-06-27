import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.UKRNET_HOST,
  port: process.env.UKRNET_PORT,
  secure: process.env.UKRNET_SECURE,
  auth: {
    user: process.env.UKRNET_EMAIL,
    pass: process.env.UKRNET_API_KEY,
  },
});

export const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.BASE_URL}:${process.env.PORT || 3000}/api/auth/verify/${verificationToken}`;

  const mailOptions = {
    from: process.env.UKRNET_EMAIL,
    to: email,
    subject: "Email Verification",
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};
