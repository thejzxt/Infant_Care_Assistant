import express from "express";
import {
  addPediatrician,
  getPediatricians,
  deletePediatrician,
} from "../controllers/pediatricianController.js";

const router = express.Router();

router.post("/add", addPediatrician);
router.get("/:parentId", getPediatricians);
router.delete("/:id", deletePediatrician);

export default router;