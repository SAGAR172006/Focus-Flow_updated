const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User.model.js"); // This import is now correct
const { protect } = require("../middleware/auth.middleware.js");

// --- Helper Function to Generate JWT ---
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * parseInt(process.env.JWT_EXPIRE || "30"),
  });
};

// --- API Endpoints ---

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password, username, fullName } = req.body;

  try {
    // THIS IS THE FIX (was user.findone)
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      email,
      password,
      username,
      fullName,
    });

    if (user) {
      res.status(201).json({
        message: "User registered successfully. Please log in.",
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // THIS IS THE FIX (was user.findone)
    const user = await User.findOne({ email });

    // Check if user exists AND if password matches
    if (user && (await user.comparePassword(password))) {
      generateToken(res, user._id);
      
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// --- GOOGLE OAUTH ROUTES ---
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/auth?error=google-failed`,
    session: false,
  }),
  (req, res) => {
    generateToken(res, req.user._id);
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/dashboard`);
  }
);

// POST /api/auth/guest
router.post("/guest", (req, res) => {
  const guestId = "guest_" + new Date().getTime();
  generateToken(res, guestId);
  
  res.status(200).json({
    _id: guestId,
    username: "Guest",
    email: "guest@example.com",
    fullName: "Guest User",
  });
});

module.exports = router;