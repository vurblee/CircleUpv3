const express = require("express");

const authenticateUser = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
<<<<<<< HEAD
const pool = require("../config/db");
const multer = require('multer');
const upload = multer();
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

// Configure AWS using environment variables defined in your .env
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME, // e.g., elasticbeanstalk-us-west-1-337909755511
    acl: "public-read",
    key: function (req, file, cb) {
      // Use folder from environment variable if provided
      let folder = process.env.AWS_BUCKET_FOLDER || "";
      if (folder) {
        folder += "/";
      }
      const extension = file.originalname.split(".").pop();
      const filename = `profile-${req.params.id}-${Date.now()}.${extension}`;
      cb(null, folder + filename);
    },
  }),
});
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

const router = express.Router();

// Helper function to validate UUID strings
const isValidUuid = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

<<<<<<< HEAD
const getProfilePicUrl = (pic) => {
  if (!pic) return "https://via.placeholder.com/100";
  if (pic.startsWith("http://") || pic.startsWith("https://")) return pic;
  return `http://192.168.1.231:5000/${pic}`;
};

=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
/**
 * 🔎 Advanced Search for Users (Fuzzy Search)
 */
router.get("/search", authenticateUser, async (req, res) => {
  try {
    const { query } = req.query;
    console.log(`🔍 Received search request for: ${query}`);

    if (!query) {
      console.log("❌ No search query provided.");
      return res.status(400).json({ error: "Search query is required" });
    }

    console.log("🚀 Executing SQL query...");
    const users = await pool.query(
      `SELECT id, name, username, email, profile_picture 
       FROM users 
       WHERE username ILIKE $1 OR name ILIKE $1 
       ORDER BY SIMILARITY(username, $2) DESC 
       LIMIT 10`,
      [`%${query}%`, query]
    );

    console.log(`✅ Search complete. Users found: ${users.rows.length}`);
    res.status(200).json(users.rows);
  } catch (error) {
    console.error("❌ Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 👤 Fetch User Profile
 */
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidUuid(id)) {
      console.error("Invalid user id provided:", id);
      return res.status(400).json({ error: "Invalid user id" });
    }
    const user = await pool.query(
      "SELECT id, name, username, email, profile_picture, bio, interests, events_visited, created_at FROM users WHERE id = $1",
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ✅ Get Current User (Me)
 */
router.get("/me", authenticateUser, async (req, res) => {
  try {
    let userId = req.user.userId;
    // If userId is "me", decode the token to get the real id
    if (userId === "me") {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }
    if (!userId || !isValidUuid(userId)) {
      console.error("Invalid user id provided:", userId);
      return res.status(400).json({ error: "Invalid user id" });
    }
    const user = await pool.query(
      "SELECT id, name, username, email, profile_picture, bio, interests, events_visited FROM users WHERE id = $1",
      [userId]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching current user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ✅ Get User Status
 */
router.get("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidUuid(id)) {
      console.error("Invalid user id provided:", id);
      return res.status(400).json({ error: "Invalid user id" });
    }
    const userStatus = await pool.query(
      "SELECT is_online, status_message FROM users WHERE id = $1",
      [id]
    );

    if (userStatus.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(userStatus.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching user status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔄 Update Online Status & Status Message
 */
router.put("/status", authenticateUser, async (req, res) => {
  try {
    const { status } = req.body;
    let userId = req.user.userId;
    if (userId === "me") {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }
    if (!userId || !isValidUuid(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const validStatuses = ["Online", "Away", "Busy", "Invisible"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Allowed: Online, Away, Busy, Invisible" });
    }

    await pool.query("UPDATE users SET status_message = $1 WHERE id = $2", [status, userId]);

    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("❌ Error updating user status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ✏️ Edit User Profile (Only Owner)
 */
<<<<<<< HEAD
router.put("/:id", authenticateUser, upload.none(), async (req, res) => {
=======
router.put("/:id", authenticateUser, async (req, res) => {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  try {
    const { id } = req.params;
    const { name, email, username, bio, interests, events_visited } = req.body;
    if (!name || !email || !username) {
      return res.status(400).json({ error: "Name, email, and username are required" });
    }
    let userId = req.user.userId;
    if (userId === "me") {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }
    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized to edit this profile" });
    }

<<<<<<< HEAD
    // Parse interests and events_visited from JSON string to an array
    let parsedInterests;
    try {
      parsedInterests = interests ? JSON.parse(interests) : [];
    } catch (err) {
      parsedInterests = [];
    }

    let parsedEvents = events_visited ? JSON.parse(events_visited) : [];

    // Update query using parsed arrays
=======
    // Update query: note we now use 7 parameters.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    const updatedUser = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, username = $3, bio = $4, interests = $5, events_visited = $6 
       WHERE id = $7 
       RETURNING id, name, username, email, profile_picture, bio, interests, events_visited`,
      [
        name,
        email,
        username,
        bio || "",
<<<<<<< HEAD
        parsedInterests,
        parsedEvents,
=======
        interests || [],
        events_visited || [],
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        userId,
      ]
    );

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser.rows[0] });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔑 Change Password (Only Owner)
 */
router.put("/:id/change-password", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    let userId = req.user.userId;
    if (userId === "me") {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }
    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized to change this password" });
    }

    const user = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
    const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📸 Upload Profile Picture (Dummy Upload for Now)
 */
<<<<<<< HEAD
router.post("/:id/profile-picture", authenticateUser, uploadS3.single("profile_picture"), async (req, res) => {
  console.log("Uploaded file:", req.file); // Check if req.file.location exists
  try {
    const { id } = req.params;
=======
router.post("/:id/profile-picture", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { profile_picture } = req.body;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    let userId = req.user.userId;
    if (userId === "me") {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }
    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized to change profile picture" });
    }

<<<<<<< HEAD
    // Ensure req.file exists
    if (!req.file || !req.file.location) {
      return res.status(400).json({ error: "Upload failed, no file location" });
    }

    // Use the S3 URL from multer-s3
    const s3Url = req.file.location;
    await pool.query(
      "UPDATE users SET profile_picture = $1 WHERE id = $2",
      [s3Url, userId]
    );

    res.status(200).json({ message: "Profile picture updated", profile_picture: s3Url });
=======
    const updatedUser = await pool.query(
      "UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING id, name, username, email, profile_picture, bio, interests, events_visited",
      [profile_picture, userId]
    );

    res.status(200).json({ message: "Profile picture updated successfully", user: updatedUser.rows[0] });
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  } catch (error) {
    console.error("❌ Error updating profile picture:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET Interests for a User
 */
router.get("/:id/interests", authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT interests FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ interests: result.rows[0].interests || [] });
  } catch (error) {
    console.error("Error fetching interests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST Add a New Interest
 */
router.post("/:id/interests", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { interest } = req.body;
  if (!interest) return res.status(400).json({ error: "Interest is required" });
  try {
    const result = await pool.query(
      "UPDATE users SET interests = array_append(coalesce(interests, '{}'), $1) WHERE id = $2 RETURNING interests",
      [interest, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ interests: result.rows[0].interests });
  } catch (error) {
    console.error("Error adding interest:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE Remove an Interest
 */
router.delete("/:id/interests", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { interest } = req.body;
  if (!interest) return res.status(400).json({ error: "Interest is required" });
  try {
    const result = await pool.query(
      "UPDATE users SET interests = array_remove(coalesce(interests, '{}'), $1) WHERE id = $2 RETURNING interests",
      [interest, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ interests: result.rows[0].interests });
  } catch (error) {
    console.error("Error removing interest:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET Events Visited for a User
 */
router.get("/:id/events-visited", authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT events_visited FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ events: result.rows[0].events_visited || [] });
  } catch (error) {
    console.error("Error fetching events visited:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
