const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware.js"); // <-- This path is now correct
const TimeLog = require("../models/TimeLog.model.js"); // <-- This path is now correct

router.use(protect); // Protect all log routes

// POST /api/log-time
// Logs a new time session
router.post("/", async (req, res) => {
  try {
    const { session_type, duration } = req.body;
    const log = new TimeLog({
      session_type,
      duration,
      user: req.user._id,
    });
    const createdLog = await log.save();
    res.status(201).json(createdLog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;