const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware"); // Import the middleware
require("dotenv").config();

const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, username, and password are required" });
    }

    // Check if user already exists with same email or username
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User already exists with this email or username" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user (username is now required)
    const newUser = await pool.query(
      "INSERT INTO users (name, email, username, password, role, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
      [name, email, username, hashedPassword, role || "user"]
    );

    // Generate JWT Token (expires in 7 days)
    const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists (login is via email)
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log(`🔹 Password Reset Token for ${email}: ${resetToken}`);

    res.status(200).json({ message: "Password reset token generated", token: resetToken });
  } catch (error) {
    console.error("❌ Error generating password reset token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔑 Change Password for Authenticated User
 * This route allows an authenticated user to change their password by providing their current password and a new password.
 */
router.put("/change-password", authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required." });
    }

    // Get the userId from the authenticated request.
    let userId = req.user.userId;
    if (userId === "me") {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }

    // Retrieve the current hashed password from the database.
    const userResult = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify that the provided currentPassword is correct.
    const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash the new password and update the database.
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
