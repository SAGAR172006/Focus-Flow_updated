const mongoose = require("mongoose");

const CalorieRecordSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["gained", "spent"],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  recorded_at: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const CalorieRecord = mongoose.model("CalorieRecord", CalorieRecordSchema);
module.exports = CalorieRecord;