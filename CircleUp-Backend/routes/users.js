const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const multer = require("multer");
const upload = multer();
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

// Load AWS credentials and region from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file) => {
  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${process.env.AWS_BUCKET_FOLDER}/${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read", // Ensure public access if needed
      },
    });

    const result = await upload.done();
    console.log("Uploaded to S3:", result.Location);
    return result.Location; // Returns URL like https://<bucket>.s3.amazonaws.com/<folder>/<filename>
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

const router = express.Router();

// Helper function to validate UUID strings
const isValidUuid = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Helper function to validate integer IDs
const isValidInteger = (id) => {
  return /^\d+$/.test(id);
};

const getProfilePicUrl = (pic) => {
  if (!pic) return "https://via.placeholder.com/100";
  if (pic.startsWith("http://") || pic.startsWith("https://")) return pic;
  return `http://192.168.1.231:5000/${pic}`;
};

/**
 * 🔎 Advanced Search for Users (Fuzzy Search)
 * GET /api/users/search
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
 * GET /api/users/:id
 */
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user.userId;

    if (!id || id === "undefined" || !isValidUuid(id)) {
      console.error("Invalid user ID provided:", id);
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Fetch user details
    const user = await pool.query(
      "SELECT id, name, email, username, bio, profile_picture, interests, is_online, is_private FROM users WHERE id = $1",
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = user.rows[0];

    // Check if the profile is private and if the requester is a friend
    if (userData.is_private && id !== loggedInUserId) {
      const friendship = await pool.query(
        `
        SELECT * FROM friends
        WHERE status = 'accepted'
          AND ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
        `,
        [loggedInUserId, id]
      );

      if (friendship.rows.length === 0) {
        return res.status(403).json({ error: "This profile is private and only visible to friends" });
      }
    }

    // Fetch user photos
    const photos = await pool.query(
      "SELECT id, photo_url, caption FROM user_photos WHERE user_id = $1 ORDER BY created_at DESC",
      [id]
    );
    console.log("Fetched photos for user:", photos.rows); // Debug log

    res.status(200).json({
      ...userData,
      photos: photos.rows,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ✅ Get Current User (Me)
 * GET /api/users/me
 */
router.get("/me", authenticateUser, async (req, res) => {
  try {
    let userId = req.user.userId;
    if (userId === "me") {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }

    if (!userId || !isValidUuid(userId)) {
      console.error("Invalid user ID provided:", userId);
      return res.status(400).json({ error: "Invalid user ID" });
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
 * GET /api/users/:id/status
 */
router.get("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidUuid(id)) {
      console.error("Invalid user ID provided:", id);
      return res.status(400).json({ error: "Invalid user ID" });
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
 * PUT /api/users/status
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
      return res.status(400).json({ error: "Invalid user ID" });
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
 * PUT /api/users/:id
 */
router.put("/:id", authenticateUser, upload.none(), async (req, res) => {
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

    // Parse interests and events_visited from JSON string to an array
    let parsedInterests;
    try {
      parsedInterests = interests ? JSON.parse(interests) : [];
    } catch (err) {
      parsedInterests = [];
    }

    let parsedEvents = events_visited ? JSON.parse(events_visited) : [];

    // Update query using parsed arrays
    const updatedUser = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, username = $3, bio = $4, interests = $5, events_visited = $6 
       WHERE id = $7 
       RETURNING id, name, username, email, profile_picture, bio, interests, events_visited`,
      [name, email, username, bio || "", parsedInterests, parsedEvents, userId]
    );

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser.rows[0] });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔑 Change Password (Only Owner)
 * PUT /api/users/:id/change-password
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
 * 📸 Upload Profile Picture
 * POST /api/users/:id/profile-picture
 */
router.post("/:id/profile-picture", authenticateUser, upload.single("profile_picture"), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized to change profile picture" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File received for upload:", req.file);

    const s3Url = await uploadToS3(req.file);

    console.log("Uploaded to S3:", s3Url);

    await pool.query("UPDATE users SET profile_picture = $1 WHERE id = $2", [s3Url, userId]);

    res.status(200).json({ message: "Profile picture updated", profile_picture: s3Url });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET Interests for a User
 * GET /api/users/:id/interests
 */
router.get("/:id/interests", authenticateUser, async (req, res) => {
  const { id } = req.params;
  if (!id || !isValidUuid(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

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
 * POST /api/users/:id/interests
 */
router.post("/:id/interests", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { interest } = req.body;
  if (!id || !isValidUuid(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

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
 * DELETE /api/users/:id/interests
 */
router.delete("/:id/interests", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { interest } = req.body;
  if (!id || !isValidUuid(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

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
 * GET /api/users/:id/events-visited
 */
router.get("/:id/events-visited", authenticateUser, async (req, res) => {
  const { id } = req.params;
  if (!id || !isValidUuid(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

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

/**
 * POST Add Photos to User Profile
 * POST /api/users/:id/photos
 */
router.post("/:id/photos", authenticateUser, upload.single("photo"), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { caption } = req.body;

    if (!id || !isValidUuid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized to add photos to this profile" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No photo uploaded" });
    }

    const s3Url = await uploadToS3(req.file);

    // Save the photo URL and caption to the database (id is auto-incremented by SERIAL)
    const result = await pool.query(
      "INSERT INTO user_photos (user_id, photo_url, caption) VALUES ($1, $2, $3) RETURNING id, photo_url, caption",
      [userId, s3Url, caption || null]
    );

    const newPhoto = result.rows[0];
    console.log("Photo added to DB:", newPhoto); // Debug log

    res.status(200).json({
      message: "Photo added successfully",
      photo_id: newPhoto.id, // Return integer ID
      photo_url: newPhoto.photo_url,
      caption: newPhoto.caption || null,
    });
  } catch (error) {
    console.error("Error adding photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE Remove Photos from User Profile (Multiple Photos)
 * DELETE /api/users/:id/photos
 */
router.delete("/:id/photos", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id || !isValidUuid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete photos from this profile" });
    }

    const { photoIds } = req.body;
    if (!photoIds || !Array.isArray(photoIds)) {
      return res.status(400).json({ error: "Invalid photo IDs" });
    }

    for (const photoId of photoIds) {
      if (!isValidInteger(photoId)) {
        console.log(`Invalid photo ID: ${photoId}`);
        continue;
      }

      const photo = await pool.query(
        "SELECT photo_url FROM user_photos WHERE id = $1 AND user_id = $2",
        [photoId, userId]
      );

      if (photo.rows.length === 0) {
        console.log(`Photo with ID ${photoId} not found`);
        continue;
      }

      const photoUrl = photo.rows[0].photo_url;
      const s3Key = photoUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
        })
      );

      console.log("Deleted from S3:", s3Key);

      await pool.query("DELETE FROM user_photos WHERE id = $1 AND user_id = $2", [photoId, userId]);
    }

    res.status(200).json({ message: "Photos deleted successfully" });
  } catch (error) {
    console.error("Error deleting photos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE Remove Photo from User Profile (Single Photo)
 * DELETE /api/users/:id/photos/:photoId
 */
router.delete("/:id/photos/:photoId", authenticateUser, async (req, res) => {
  try {
    const { id, photoId } = req.params;
    const userId = req.user.userId;

    if (!id || !isValidUuid(id)) {
      console.error("Invalid user ID:", id);
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!photoId || !isValidInteger(photoId)) {
      console.error("Invalid photo ID:", photoId);
      return res.status(400).json({ error: "Invalid photo ID" });
    }

    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this photo" });
    }

    // Fetch the photo from the database
    const photo = await pool.query(
      "SELECT photo_url FROM user_photos WHERE id = $1 AND user_id = $2",
      [photoId, userId]
    );

    if (photo.rows.length === 0) {
      console.log(`Photo not found for ID: ${photoId}`);
      return res.status(404).json({ error: "Photo not found" });
    }

    const photoUrl = photo.rows[0].photo_url;
    console.log("Photo URL to delete:", photoUrl); // Debug log

    // Extract S3 key from the URL
    let s3Key;
    try {
      const url = new URL(photoUrl);
      s3Key = url.pathname.substring(1); // Remove leading '/'
      console.log("S3 Key extracted:", s3Key); // Debug log
    } catch (error) {
      console.error("Error parsing photo URL:", error.message);
      return res.status(400).json({ error: "Invalid photo URL format" });
    }

    // Delete the photo from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      })
    );
    console.log(`Deleted from S3: ${s3Key}`);

    // Delete the photo from the database
    await pool.query("DELETE FROM user_photos WHERE id = $1 AND user_id = $2", [photoId, userId]);

    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔒 Toggle Profile Visibility (Hide from Non-Friends)
 * PUT /api/users/:id/toggle-visibility
 */
router.put("/:id/toggle-visibility", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_private } = req.body;
    const userId = req.user.userId;

    if (!id || !isValidUuid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized to change this profile's visibility" });
    }

    if (typeof is_private !== "boolean") {
      return res.status(400).json({ error: "is_private must be a boolean" });
    }

    const updatedUser = await pool.query(
      "UPDATE users SET is_private = $1 WHERE id = $2 RETURNING is_private",
      [is_private, userId]
    );

    res.status(200).json({ message: "Profile visibility updated", is_private: updatedUser.rows[0].is_private });
  } catch (error) {
    console.error("Error toggling profile visibility:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📥 Download All User Data
 * GET /api/users/:id/download-data
 */
router.get("/:id/download-data", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id || !isValidUuid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized to download this user's data" });
    }

    // Collect user data
    const user = await pool.query(
      "SELECT id, name, username, email, bio, profile_picture, interests, events_visited, created_at, is_private FROM users WHERE id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Collect user photos
    const photos = await pool.query(
      "SELECT id, photo_url, caption, created_at FROM user_photos WHERE user_id = $1",
      [userId]
    );

    // Collect user posts
    const posts = await pool.query(
      "SELECT id, title, content, is_event, event_date, banner_photo, total_likes, user_liked, created_at, updated_at FROM posts WHERE user_id = $1",
      [userId]
    );

    // Collect friends
    const friends = await pool.query(
      `
      SELECT 
        CASE 
          WHEN f.user_id = $1 THEN u.id
          ELSE u2.id
        END AS id,
        CASE 
          WHEN f.user_id = $1 THEN u.username
          ELSE u2.username
        END AS username,
        f.status,
        f.created_at,
        f.updated_at
      FROM friends f
      LEFT JOIN users u ON f.friend_id = u.id
      LEFT JOIN users u2 ON f.user_id = u2.id
      WHERE f.status = 'accepted'
        AND ($1 = f.user_id OR $1 = f.friend_id)
      `,
      [userId]
    );

    // Collect messages
    const messages = await pool.query(
      `
      SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at
      FROM messages m
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      `,
      [userId]
    );

    const userData = {
      user: user.rows[0],
      photos: photos.rows,
      posts: posts.rows,
      friends: friends.rows,
      messages: messages.rows,
    };

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="user_data_${userId}.json"`);
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error downloading user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🗑️ Delete User Profile
 * DELETE /api/users/:id
 */
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id || !isValidUuid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (id !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this profile" });
    }

    // Start a transaction to ensure data consistency
    await pool.query("BEGIN");

    // Delete user photos from S3 and database
    const photos = await pool.query(
      "SELECT photo_url FROM user_photos WHERE user_id = $1",
      [userId]
    );
    for (const photo of photos.rows) {
      const photoUrl = photo.photo_url;
      const s3Key = photoUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
        })
      );
    }
    await pool.query("DELETE FROM user_photos WHERE user_id = $1", [userId]);

    // Delete user posts (and associated banner photos if any)
    const posts = await pool.query(
      "SELECT banner_photo FROM posts WHERE user_id = $1 AND banner_photo IS NOT NULL",
      [userId]
    );
    for (const post of posts.rows) {
      const bannerUrl = post.banner_photo;
      const s3Key = bannerUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
        })
      );
    }
    await pool.query("DELETE FROM posts WHERE user_id = $1", [userId]);

    // Delete profile picture from S3 if exists
    const user = await pool.query(
      "SELECT profile_picture FROM users WHERE id = $1",
      [userId]
    );
    if (user.rows[0].profile_picture) {
      const profilePicUrl = user.rows[0].profile_picture;
      const s3Key = profilePicUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
        })
      );
    }

    // Delete friendships
    await pool.query(
      "DELETE FROM friends WHERE user_id = $1 OR friend_id = $1",
      [userId]
    );

    // Delete messages
    await pool.query(
      "DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1",
      [userId]
    );

    // Delete the user
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    // Commit the transaction
    await pool.query("COMMIT");

    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error deleting user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;