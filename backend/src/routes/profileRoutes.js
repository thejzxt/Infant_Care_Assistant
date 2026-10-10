import express from "express";
import {
  getProfile,
  updateParent,
  updateInfant,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", getProfile);            // fetch profile
router.put("/parent", updateParent);    // update parent
router.put("/infant", updateInfant);    // update infant

export default router;
