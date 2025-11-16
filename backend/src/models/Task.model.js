const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    default: "General",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  due_date: {
    type: Date,
  },
  completed_at: {
    type: Date,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  // This links the task to a specific user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// This line compiles the schema into a model
const Task = mongoose.model("Task", TaskSchema);

// THIS IS THE FIX: You were exporting the Schema, not the Model.
module.exports = Task;