import mongoose from "mongoose";

const FeedingGuideSchema = new mongoose.Schema({
  ageFrom: Number,
  ageTo: Number,

  milkAmount: String,
  frequency: String,

  breastFeeding: String,
  formulaFeeding: String,
  solidFeeding: String,

  cereals: String,
  fruits: String,
  vegetables: String,
  proteins: String,
  snacks: String,

  developmentNotes: String,
});

export default mongoose.model("FeedingGuide", FeedingGuideSchema);