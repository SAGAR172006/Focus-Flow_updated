const mongoose = require("mongoose");

const TimeLogSchema = new mongoose.Schema({
  session_type: {
    type: String,
    enum: ["timer", "pomodoro", "stopwatch"],
    required: true,
  },
  duration: {
    type: Number, // Stored in seconds
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const TimeLog = mongoose.model("TimeLog", TimeLogSchema);
module.exports = TimeLog;