import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import cryRoutes from "./src/routes/cryHistory.js";
import feedingGuideRoutes from "./src/routes/feedingGuideRoutes.js";
import feedingScheduleRoutes from "./src/routes/feedingScheduleRoutes.js";
import feedingLogRoutes from "./src/routes/feedingLogRoutes.js";
import pediatricianRoutes from "./src/routes/pediatricianRoutes.js";
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/cry", cryRoutes);
app.use("/api/feeding-guide", feedingGuideRoutes);
app.use("/api/feeding-schedule", feedingScheduleRoutes);
app.use("/api/feeding-log", feedingLogRoutes);
app.use("/api/pediatrician", pediatricianRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

  app.get("/", (req, res) => {
  res.send("Backend is reachable");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(5000, '0.0.0.0', () => {
  console.log("Server running on port 5000");
});