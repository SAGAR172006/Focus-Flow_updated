const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
  },
  googleId: {
    // For Google OAuth
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- Mongoose "pre-save" Hook ---
// This runs BEFORE a new user is saved to the database
UserSchema.pre("save", async function (next) {
  // Only hash the password if it's new or has been modified
  if (!this.isModified("password")) {
    return next();
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Mongoose "method" ---
// This adds a custom method to all User documents
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// This line compiles the schema into a model
const User = mongoose.model("User", UserSchema);

// THIS IS THE FIX: We export the Model (User), not the Schema (UserSchema)
module.exports = User;