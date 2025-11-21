const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // <-- Make sure path is correct

// ===============================
// POST /api/auth/register
// ===============================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email and password are required"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name: name || "",
      email: email.toLowerCase(),
      password: hashedPassword,   // <-- IMPORTANT (your schema uses password)
      createdAt: new Date()
    });

    await user.save();

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      ok: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      ok: false,
      message: "Server error during registration"
    });
  }
});


// ===============================
// POST /api/auth/login     (Optional)
// ===============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, message: "Invalid password" });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      ok: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ ok: false, message: "Server error during login" });
  }
});

module.exports = router;