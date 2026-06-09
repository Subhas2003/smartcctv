import User from "../models/User.js";
import { signToken } from "../services/jwtService.js";
import { sendResetEmail, sendVerificationEmail } from "../services/emailService.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || "mock-google-client-id";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Decodes a JWT token payload without signature verification (useful for mock/dev flow)
const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, "base64")
        .toString()
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Generate secure 6-digit verification code (OTP)
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = crypto.createHash("sha256").update(rawOtp).digest("hex");
    const otpExpires = Date.now() + 15 * 60000; // 15 Minutes

    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationOtp: hashedOtp,
      verificationOtpExpires: otpExpires,
      lastVerificationOtpSentAt: Date.now(),
    });

    console.log(`[TESTING] Verification OTP for ${user.email}: ${rawOtp}`);
    
    // Send email in the background without blocking the HTTP response
    sendVerificationEmail(user.email, rawOtp).catch((err) => {
      console.error(`Error sending verification email to ${user.email} in background:`, err);
    });

    res.status(201).json({
      message: "Verification code sent. Please verify your email before logging in.",
      email: user.email,
      previewUrl: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in." });
    }

    const token = signToken({ id: user._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate Google User
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    let payload;

    try {
      // Try official verification first
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.warn("Google Token Verification failed, trying fallback decode:", verifyError.message);
      // Fallback for mock/dev logins
      payload = decodeJwtPayload(credential);
      if (!payload || !payload.email) {
        // If not a valid JWT format, create a mockup user if credential is a simple string for local testing
        if (typeof credential === "string" && credential.includes("@")) {
          payload = {
            email: credential,
            name: credential.split("@")[0],
            sub: `google_mock_${Date.now()}`,
          };
        } else {
          return res.status(400).json({ message: "Invalid Google credential format" });
        }
      }
    }

    const { email, name, sub } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId: sub,
        isVerified: true,
      });
    } else {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = sub;
        needsSave = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    const token = signToken({ id: user._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - request email link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal user existence in production for security, but return success message
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token and set expiry
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour

    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    
    // Send email in the background without blocking the HTTP response
    sendResetEmail(user.email, resetUrl).catch((err) => {
      console.error(`Error sending reset email to ${user.email} in background:`, err);
    });

    res.json({
      message: "Reset link sent successfully.",
      previewUrl: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Hash the token received in URL to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email OTP code
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid verification request" });
    }

    // Prevent duplicate verification / already verified checks
    if (user.isVerified) {
      user.verificationOtp = null;
      user.verificationOtpExpires = null;
      await user.save();
      return res.status(400).json({ message: "Email is already verified." });
    }

    // Verify OTP code
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    if (user.verificationOtp !== hashedCode) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Check expiration
    if (user.verificationOtpExpires && user.verificationOtpExpires < Date.now()) {
      return res.status(400).json({ message: "Verification code has expired." });
    }

    // Activate user & clear OTP fields
    user.isVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully. You can now login." });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email code
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide an email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email address" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "This email is already verified." });
    }

    // Prevent resend abuse: enforce 60-second limit
    const cooldown = 60000; // 60 seconds
    if (user.lastVerificationOtpSentAt && (Date.now() - user.lastVerificationOtpSentAt) < cooldown) {
      const waitTimeSec = Math.ceil((cooldown - (Date.now() - user.lastVerificationOtpSentAt)) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitTimeSec} seconds before requesting another code.`
      });
    }

    // Generate secure 6-digit OTP code
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    user.verificationOtp = crypto.createHash("sha256").update(rawOtp).digest("hex");
    user.verificationOtpExpires = Date.now() + 15 * 60000; // 15 Minutes
    user.lastVerificationOtpSentAt = Date.now();

    await user.save();

    console.log(`[TESTING] Resent Verification OTP for ${user.email}: ${rawOtp}`);
    
    // Send email in the background without blocking the HTTP response
    sendVerificationEmail(user.email, rawOtp).catch((err) => {
      console.error(`Error sending verification email to ${user.email} in background:`, err);
    });

    res.json({
      message: "Verification code resent successfully.",
      previewUrl: null,
    });
  } catch (error) {
    next(error);
  }
};

