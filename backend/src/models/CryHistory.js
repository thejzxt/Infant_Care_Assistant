const mongoose = require("mongoose");

const cryHistorySchema = new mongoose.Schema({
  infantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Infant",
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("CryHistory", cryHistorySchema);