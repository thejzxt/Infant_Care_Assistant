const express = require("express");
const router = express.Router();
const CryHistory = require("../models/CryHistory");


// SAVE CRY RECORD
router.post("/addCry", async (req, res) => {
  try {

    const { infantId, reason } = req.body;

    const now = new Date();

    const cry = new CryHistory({
      infantId,
      reason,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString()
    });

    await cry.save();

    res.status(201).json({ message: "Cry record saved", cry });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET CRY HISTORY FOR A SPECIFIC INFANT
router.get("/history/:infantId", async (req, res) => {
  try {

    const cryHistory = await CryHistory
      .find({ infantId: req.params.infantId })
      .sort({ createdAt: -1 });

    res.json(cryHistory);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;