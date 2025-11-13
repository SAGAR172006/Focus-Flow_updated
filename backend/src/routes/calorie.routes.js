const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware.js"); // <-- This path is now correct
const CalorieRecord = require("../models/Calorie.model.js"); // <-- This path is now correct

router.use(protect); // Protect all calorie routes

// GET /api/calories
// Fetches all calorie records for the logged-in user
router.get("/", async (req, res) => {
  try {
    const records = await CalorieRecord.find({ user: req.user._id }).sort({
      recorded_at: -1,
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/calories
// Adds a new calorie record for the logged-in user
router.post("/", async (req, res) => {
  try {
    const { type, description, calories } = req.body;
    const record = new CalorieRecord({
      type,
      description,
      calories,
      user: req.user._id,
    });
    const createdRecord = await record.save();
    res.status(201).json(createdRecord);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;