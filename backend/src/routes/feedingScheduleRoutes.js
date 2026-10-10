import express from "express";
import FeedingSchedule from "../models/FeedingSchedule.js";

const router = express.Router();

/* GET SCHEDULE BASED ON AGE */

router.get("/:age", async (req, res) => {
  const age = parseInt(req.params.age);

  try {
    const schedule = await FeedingSchedule.findOne({
      ageFrom: { $lte: age },
      ageTo: { $gte: age },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;