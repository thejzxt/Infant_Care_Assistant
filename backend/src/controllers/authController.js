import nodemailer from "nodemailer";
import User from "../models/Users.js";

// ================= SIGNUP =================
export const registerUser = async (req, res) => {
  try {
    const { parentName, email, password, infants } = req.body;

    // Validation
    if (!parentName || !email || !password || !infants || infants.length === 0) {
      return res.status(400).json({
        message: "All fields including infant details are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create user
    const user = new User({
      parentName,
      email,
      password, // (hash later)
      infants,
    });

    await user.save();

    res.status(201).json({
      message: "Signup successful",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addInfant = async (req, res) => {
  try {
    const { email, infant } = req.body;

    if (!email || !infant) {
      return res.status(400).json({ message: "Missing data" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $push: { infants: infant } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Infant added successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// ================= LOGIN =================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        parentName: user.parentName,
        email: user.email,
        infants: user.infants || [],   // ✅ THIS IS THE KEY FIX
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    user.resetOTP = otp;
    await user.save();

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "abinayaanand.2004@gmail.com",
        pass: "rioepyuvcqljtksm"
      }
    });

    await transporter.sendMail({
      from: "abinayaanand.2004@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`
    });

    res.status(200).json({
      message: "OTP sent to email"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {

  try {

    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.resetOTP != otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    user.password = newPassword;
    user.resetOTP = null;

    await user.save();

    res.status(200).json({
      message: "Password updated successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};

// ================= VERIFY OTP =================
export const verifyOTP = async (req, res) => {

  try {

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.resetOTP != otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    res.status(200).json({
      message: "OTP verified"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};