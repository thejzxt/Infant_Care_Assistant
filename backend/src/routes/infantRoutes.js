import express from "express";
import User from "../models/Users.js";

const router = express.Router();

router.post("/add-infant", async (req, res) => {
  const { email, infant } = req.body;
const normalizedEmail = email.toLowerCase();


  try {
     const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.infants.push(infant);
    await user.save();

    res.status(200).json({
      message: "Infant added successfully",
      infants: user.infants,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
