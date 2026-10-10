import express from "express";
import {
  getFeedingLog,
  markFeedCompleted,
} from "../controllers/feedingLogController.js";

const router = express.Router();

router.get("/:infantId/:date/:age", getFeedingLog);

router.post("/complete", markFeedCompleted);

export default router;