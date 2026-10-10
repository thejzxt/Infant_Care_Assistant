import express from "express";
import FeedingGuide from "../models/FeedingGuide.js";

const router = express.Router();

router.get("/:age", async (req, res) => {
  const age = parseInt(req.params.age);

  try {
    const guide = await FeedingGuide.findOne({
      ageFrom: { $lte: age },
      ageTo: { $gte: age },
    });

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    res.json(guide);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;