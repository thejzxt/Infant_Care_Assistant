import mongoose from "mongoose";

const FeedSchema = new mongoose.Schema({
  feedingNumber: Number,
  time: String,
  status: {
    type: String,
    enum: ["pending", "completed", "missed"],
    default: "pending",
  },
});

const FeedingLogSchema = new mongoose.Schema({
  infantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  date: {
    type: String, // format YYYY-MM-DD
    required: true,
  },

  feeds: [FeedSchema],
});

export default mongoose.model("FeedingLog", FeedingLogSchema);