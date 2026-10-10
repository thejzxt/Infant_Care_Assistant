import mongoose from "mongoose";
import dotenv from "dotenv";
import FeedingSchedule from "../models/FeedingSchedule.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const schedules = [
  {
    ageFrom: 0,
    ageTo: 1,
    feedsPerDay: 10,
    times: [
      "6:00 AM",
      "8:00 AM",
      "10:00 AM",
      "12:00 PM",
      "2:00 PM",
      "4:00 PM",
      "6:00 PM",
      "8:00 PM",
      "10:00 PM",
      "2:00 AM",
    ],
  },

  {
    ageFrom: 1,
    ageTo: 3,
    feedsPerDay: 8,
    times: [
      "6:00 AM",
      "9:00 AM",
      "12:00 PM",
      "3:00 PM",
      "6:00 PM",
      "9:00 PM",
      "12:00 AM",
      "3:00 AM",
    ],
  },

  {
    ageFrom: 3,
    ageTo: 6,
    feedsPerDay: 6,
    times: [
      "6:00 AM",
      "10:00 AM",
      "2:00 PM",
      "6:00 PM",
      "10:00 PM",
      "2:00 AM",
    ],
  },

  {
    ageFrom: 6,
    ageTo: 9,
    feedsPerDay: 5,
    times: [
      "7:00 AM",
      "11:00 AM",
      "3:00 PM",
      "7:00 PM",
      "10:00 PM",
    ],
  },

  {
    ageFrom: 9,
    ageTo: 12,
    feedsPerDay: 4,
    times: [
      "7:00 AM",
      "12:00 PM",
      "4:00 PM",
      "8:00 PM",
    ],
  },
];

const seedSchedules = async () => {
  try {
    await FeedingSchedule.deleteMany();
    console.log("Old schedules removed");

    await FeedingSchedule.insertMany(schedules);

    console.log("Feeding schedules inserted successfully");

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedSchedules();