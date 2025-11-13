const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js"); // <-- This path is now correct

const protect = async (req, res, next) => {
  let token;

  // Read the JWT from the 'token' cookie
  token = req.cookies.token;

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get the user from the token and attach it to the request object
      // This is the line that was failing
      req.user = await User.findById(decoded.userId).select("-password");
      
      next(); // Move on to the next function (the actual route handler)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };