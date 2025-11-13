require("dotenv").config(); // Loads .env file contents
require("./passport.setup"); // This is in the root 'backend' folder, so this path is correct
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Use .env variable
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use(passport.initialize());

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch(err => console.error("Could not connect to MongoDB:", err));

// --- API Routes ---
// All paths are now corrected to point to the 'src' folder
app.use("/api/auth", require("./src/routes/auth.routes.js"));
app.use("/api/tasks", require("./src/routes/task.routes.js"));
app.use("/api/calories", require("./src/routes/calorie.routes.js"));
app.use("/api/log-time", require("./src/routes/log.routes.js"));
app.use("/api/dashboard", require("./src/routes/dashboard.routes.js"));
app.use("/api/youtube-search", require("./src/routes/youtube.routes.js"));
app.use("/api/analyze", require("./src/routes/analyze.routes.js"));

// --- Serve Frontend (for Production) ---
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});