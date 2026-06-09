import nodemailer from "nodemailer";

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  } else {
    // Generate test SMTP service from ethereal.email
    console.log("No SMTP credentials provided. Creating a test Ethereal account...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
};

export const sendResetEmail = async (email, resetUrl) => {
  try {
    const tx = await getTransporter();
    const mailOptions = {
      from: `"Smart CCTV System" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #06b6d4;">Reset Your Password</h2>
          <p>You requested to reset your password for your Smart CCTV account. Please click the button below to set a new password. This link is valid for 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #06b6d4; color: black; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
          </div>
          <p>If you did not request this email, please ignore it.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Smart CCTV Warehouse Surveillance Project 2026</p>
        </div>
      `,
    };

    const info = await tx.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    
    // If using ethereal.email, log the message preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Ethereal Email Preview URL: ${previewUrl}`);
      return { success: true, previewUrl };
    }
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const sendVerificationEmail = async (email, otp) => {
  try {
    const tx = await getTransporter();
    const mailOptions = {
      from: `"Smart CCTV System" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Email Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #06b6d4;">Verify Your Email Address</h2>
          <p>Thank you for registering. Please enter the 6-digit verification code below on the verification page to activate your account. This code is valid for 15 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background-color: #020617; border: 1px solid #06b6d4; color: #06b6d4; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px 32px; border-radius: 8px; font-family: monospace;">${otp}</span>
          </div>
          <p>If you did not request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Smart CCTV Warehouse Surveillance Project 2026</p>
        </div>
      `,
    };

    const info = await tx.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    
    // If using ethereal.email, log the message preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Ethereal Email Preview URL: ${previewUrl}`);
      return { success: true, previewUrl };
    }
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

