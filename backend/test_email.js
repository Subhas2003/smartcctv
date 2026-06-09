import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

console.log("SMTP Config:");
console.log("Host:", host);
console.log("Port:", port);
console.log("User:", user);
console.log("Pass:", pass ? "******" : "empty");

async function testEmail() {
  if (!host || !user || !pass) {
    console.error("Missing SMTP credentials in .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port) || 587,
    secure: Number(port) === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log("Verifying connection to SMTP server...");
    const verified = await transporter.verify();
    console.log("✅ SMTP connection verified successfully.");

    console.log("Sending a test email to:", user);
    const info = await transporter.sendMail({
      from: `"Smart CCTV Test" <${user}>`,
      to: user,
      subject: "Test Email from Smart CCTV",
      text: "If you received this, your SMTP settings are working perfectly!",
    });
    console.log("✅ Email sent successfully! Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ SMTP Error occurred:");
    console.error(error);
  }
}

testEmail();
