const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");

module.exports = (io) => {
  const router = express.Router();
  const notificationRoutes = require("./notifications")(io); // Import notifications routes

  /**
   * 🔎 Search Users by Username
   * GET /api/friends/search?username=<searchTerm>
   */
  router.get("/search", authenticateUser, async (req, res) => {
    try {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({ error: "Username query parameter is required." });
      }
      const result = await pool.query(
        `SELECT id, name, email, profile_picture 
         FROM users 
         WHERE name ILIKE $1 
         ORDER BY SIMILARITY(name, $2) DESC 
         LIMIT 10`,
        [`%${username}%`, username]
      );
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * 📩 Send Friend Request
   * POST /api/friends/requests
   */
  router.post("/requests", authenticateUser, async (req, res) => {
    try {
      const { friend_id } = req.body;
      const user_id = req.user.userId;

      if (!friend_id) {
        return res.status(400).json({ error: "friend_id is required" });
      }
      if (friend_id === user_id) {
        return res.status(400).json({ error: "You cannot friend yourself" });
      }

      // Check if a relationship already exists (in either direction)
      const existing = await pool.query(
        `SELECT * FROM friends
         WHERE (user_id = $1 AND friend_id = $2)
            OR (user_id = $2 AND friend_id = $1)`,
        [user_id, friend_id]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "Friend request or relationship already exists" });
      }

      const newRequest = await pool.query(
        `INSERT INTO friends (user_id, friend_id, status)
         VALUES ($1, $2, 'pending')
         RETURNING *`,
        [user_id, friend_id]
      );

      // Notify the recipient about the friend request
      await notificationRoutes.sendNotification(friend_id, newRequest.rows[0].id, "friend_request", user_id);

      return res.status(201).json({ message: "Friend request sent", data: newRequest.rows[0] });
    } catch (error) {
      console.error("Error sending friend request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * ✅ Accept Friend Request
   * PUT /api/friends/:friendId/accept
   */
  router.put("/:friendId/accept", authenticateUser, async (req, res) => {
    try {
      const { friendId } = req.params;
      const user_id = req.user.userId;

      // Check for a pending request where friendId sent to the logged-in user
      const pendingCheck = await pool.query(
        `SELECT * FROM friends
         WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
        [friendId, user_id]
      );
      if (pendingCheck.rows.length === 0) {
        return res.status(400).json({ error: "No pending friend request found from this user" });
      }

      await pool.query(
        `UPDATE friends
         SET status = 'accepted', updated_at = NOW()
         WHERE user_id = $1 AND friend_id = $2`,
        [friendId, user_id]
      );

      // Notify the sender that their friend request was accepted
      await notificationRoutes.sendNotification(friendId, pendingCheck.rows[0].id, "friend_accepted", user_id);

      return res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * 🚫 Decline Friend Request
   * PUT /api/friends/:friendId/decline
   */
  router.put("/:friendId/decline", authenticateUser, async (req, res) => {
    try {
      const { friendId } = req.params;
      const user_id = req.user.userId;

      const pendingCheck = await pool.query(
        `SELECT * FROM friends
         WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
        [friendId, user_id]
      );
      if (pendingCheck.rows.length === 0) {
        return res.status(400).json({ error: "No pending friend request to decline" });
      }

      await pool.query(
        `DELETE FROM friends
         WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
        [friendId, user_id]
      );

      return res.status(200).json({ message: "Friend request declined" });
    } catch (error) {
      console.error("Error declining friend request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * 📃 List All Accepted Friends for the Logged-In User
   * GET /api/friends
   * Returns accepted friendships as an array of objects with id, name, and profile_picture.
   */
  router.get("/", authenticateUser, async (req, res) => {
    try {
      const user_id = req.user.userId;
      // Updated query that returns id, name, and profile_picture for the accepted friend.
      const query = `
        SELECT 
          CASE 
            WHEN f.user_id = $1 THEN u.id
            ELSE u2.id
          END AS id,
          CASE 
            WHEN f.user_id = $1 THEN u.username
            ELSE u2.username
          END AS name,
          CASE
            WHEN f.user_id = $1 THEN u.profile_picture
            ELSE u2.profile_picture
          END AS profile_picture
        FROM friends f
        LEFT JOIN users u ON f.friend_id = u.id
        LEFT JOIN users u2 ON f.user_id = u2.id
        WHERE f.status = 'accepted'
          AND ($1 = f.user_id OR $1 = f.friend_id)
        ORDER BY f.created_at DESC;
      `;
      const { rows } = await pool.query(query, [user_id]);
      return res.status(200).json(rows);
    } catch (error) {
      console.error("Error listing friends:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * 📃 List Pending Friend Requests for the Logged-In User
   * GET /api/friends/pending
   */
  router.get("/pending", authenticateUser, async (req, res) => {
    try {
      const user_id = req.user.userId;
      const pendingRequests = await pool.query(
        `
        SELECT f.*, u.name AS sender_name 
        FROM friends f
        JOIN users u ON f.user_id = u.id
        WHERE f.friend_id = $1 AND f.status = 'pending'
        ORDER BY f.created_at DESC
        `,
        [user_id]
      );
      return res.status(200).json(pendingRequests.rows);
    } catch (error) {
      console.error("Error listing pending requests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * 🗑️ Remove a Friend
   * DELETE /api/friends/:friendId
   */
  router.delete("/:friendId", authenticateUser, async (req, res) => {
    try {
      const { friendId } = req.params;
      const user_id = req.user.userId;
      const remove = await pool.query(
        `DELETE FROM friends
         WHERE status = 'accepted'
           AND ((user_id = $1 AND friend_id = $2)
             OR (user_id = $2 AND friend_id = $1))`,
        [user_id, friendId]
      );
      if (remove.rowCount === 0) {
        return res.status(400).json({ error: "No accepted friendship found to remove" });
      }
      return res.status(200).json({ message: "Friend removed" });
    } catch (error) {
      console.error("Error removing friend:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};