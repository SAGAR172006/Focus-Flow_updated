const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware.js"); // <-- This path is now correct
const Task = require("../models/Task.model.js"); // <-- This path is also corrected

// --- All task routes are protected ---
router.use(protect);

// GET /api/tasks
// Fetches all tasks for the logged-in user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({
      created_at: -1,
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/tasks
// Creates a new task for the logged-in user
router.post("/", async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const task = new Task({
      title,
      description,
      category,
      priority,
      user: req.user._id, // Link task to the logged-in user
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/tasks/:id
// Updates a task (e.g., marks as complete)
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update fields
    task.status = req.body.status || task.status;
    task.completed_at = req.body.completed_at || task.completed_at;
    // Add any other fields you want to be updatable
    // task.title = req.body.title || task.title; 

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/tasks/:id
// Deletes a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // Ensures a user can only delete their own task
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;