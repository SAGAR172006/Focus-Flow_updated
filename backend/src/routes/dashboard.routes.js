const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware.js"); // <-- This path is now correct
const Task = require("../models/Task.model.js"); // <-- This path is now correct
const CalorieRecord = require("../models/Calorie.model.js"); // <-- This path is now correct
const TimeLog = require("../models/TimeLog.model.js"); // <-- This path is now correct

router.use(protect);

// GET /api/dashboard/analytics
// Fetches all data needed for the dashboard in one call
router.get("/analytics", async (req, res) => {
  try {
    // Fetch all data in parallel for the logged-in user
    const [logsResult, tasksResult, caloriesResult] = await Promise.all([
      TimeLog.find({ user: req.user._id })
        .sort({ created_at: -1 })
        .limit(100),
      Task.find({ user: req.user._id })
        .sort({ created_at: -1 })
        .limit(100),
      CalorieRecord.find({ user: req.user._id })
        .sort({ recorded_at: -1 })
        .limit(100),
    ]);

    res.status(200).json({
      logsResult,
      tasksResult,
      caloriesResult,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;