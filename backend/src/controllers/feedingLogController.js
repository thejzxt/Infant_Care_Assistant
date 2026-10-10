import FeedingLog from "../models/FeedingLog.js";
import FeedingSchedule from "../models/FeedingSchedule.js";

/* ================= GET DAILY LOG ================= */

export const getFeedingLog = async (req, res) => {
  const { infantId, date, age } = req.params;

  try {
    let log = await FeedingLog.findOne({ infantId, date });

    if (!log) {
      const schedule = await FeedingSchedule.findOne({
        ageFrom: { $lte: age },
        ageTo: { $gte: age },
      });

      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      const feeds = schedule.times.map((time, index) => ({
        feedingNumber: index + 1,
        time,
        status: "pending",
      }));

      log = await FeedingLog.create({
        infantId,
        date,
        feeds,
      });
    }

    /* ===== AUTO MISSED DETECTION ===== */

    const now = new Date();

    log.feeds.forEach((feed) => {

      if (feed.status !== "pending") return;

      const [time, period] = feed.time.split(" ");
      let [h, m] = time.split(":");

      h = parseInt(h);
      m = parseInt(m);

      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;

      /* create feed time in LOCAL timezone */

      const [year, month, day] = date.split("-");

      const feedTime = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        h,
        m,
        0,
        0
      );

      /*
        FIX:
        If feeding time occurs after midnight (like 2 AM),
        treat it as the next day feeding
      */

      if (h < 6) {
        feedTime.setDate(feedTime.getDate() + 1);
      }

      if (now > feedTime) {
        feed.status = "missed";
      }

    });

    await log.save();

    res.json(log);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= MARK COMPLETED ================= */

export const markFeedCompleted = async (req, res) => {

  const { infantId, date, feedingNumber } = req.body;

  try {

    const log = await FeedingLog.findOne({ infantId, date });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    const feed = log.feeds.find(
      (f) => f.feedingNumber === feedingNumber
    );

    if (feed) {
      feed.status = "completed";
    }

    await log.save();

    res.json(log);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }

};