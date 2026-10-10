import express from "express";
import { 
  registerUser, 
  addInfant,  
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOTP

} from "../controllers/authController.js";

const router = express.Router();

// Signup route
router.post("/signup", registerUser);

// Add infant
router.post("/add-infant", addInfant);

// Login
router.post("/login", loginUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

router.post("/verify-otp", verifyOTP);

export default router;