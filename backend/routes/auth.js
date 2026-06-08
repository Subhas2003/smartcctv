import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  verifyEmail,
  resendVerification,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import { validateSignup, validateLogin } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/signup", validateSignup, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/profile", protect, getProfile);

export default router;
