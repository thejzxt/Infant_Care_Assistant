import mongoose from "mongoose";

const InfantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, required: true },
  weight: { type: String, required: true },
 
});

const UserSchema = new mongoose.Schema(
  {
    parentName: {
      type: String,
      required: true, 
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    resetOTP: {
  type: Number
},
    password: {
      type: String,
      required: true,
    },
    
    infants: [InfantSchema],
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);