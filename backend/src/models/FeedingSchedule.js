import mongoose from "mongoose";

const FeedingScheduleSchema = new mongoose.Schema({
  ageFrom: Number,
  ageTo: Number,

  feedsPerDay: Number,

  times: [String],
});

export default mongoose.model("FeedingSchedule", FeedingScheduleSchema);