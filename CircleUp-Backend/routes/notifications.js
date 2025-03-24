const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");

module.exports = (io) => {
  const router = express.Router();

  /**
   * 📌 Fetch Individual Notifications (Unread First)
   */
  router.get("/", authenticateUser, async (req, res) => {
    try {
<<<<<<< HEAD
      const userId = req.user.userId;
      console.log(`Fetching notifications for userId: ${userId}`);
=======
      const userId = req.user.id;
      console.log(`Fetching notifications for individual with id: ${userId}`);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

      const query = `
        SELECT *
        FROM notifications
        WHERE id = $1
        ORDER BY is_read ASC, created_at DESC
      `;
      const { rows } = await pool.query(query, [userId]);
<<<<<<< HEAD
=======
      console.log("Notifications retrieved for id:", userId, rows);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      res.status(200).json(rows);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error.stack || error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * ✅ Get Unread Notifications for Individual
   */
  router.get("/unread", authenticateUser, async (req, res) => {
    try {
<<<<<<< HEAD
      const userId = req.user.userId;
=======
      const userId = req.user.id;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      const query = `
        SELECT *
        FROM notifications
        WHERE id = $1
          AND is_read = false
        ORDER BY created_at DESC
      `;
      const { rows } = await pool.query(query, [userId]);
      res.status(200).json(rows);
    } catch (error) {
      console.error("❌ Error fetching unread notifications:", error.stack || error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * ✅ Mark Notification as Read for Individual
   */
  router.put("/:notif_id/read", authenticateUser, async (req, res) => {
    try {
      const { notif_id } = req.params;
<<<<<<< HEAD
      const userId = req.user.userId;
=======
      const userId = req.user.id;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

      const updateQuery = `
        UPDATE notifications
        SET is_read = true
        WHERE notif_id = $1
          AND id = $2
        RETURNING *
      `;
      const { rowCount } = await pool.query(updateQuery, [notif_id, userId]);

      if (rowCount === 0) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("❌ Error marking notification as read:", error.stack || error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * ✅ Mark All Notifications as Read for Individual
   */
  router.put("/mark-all-read", authenticateUser, async (req, res) => {
    try {
<<<<<<< HEAD
      const userId = req.user.userId;
=======
      const userId = req.user.id;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

      const updateQuery = `
        UPDATE notifications
        SET is_read = true
        WHERE id = $1
      `;
      await pool.query(updateQuery, [userId]);

      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("❌ Error marking all notifications as read:", error.stack || error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * 🗑️ Delete a Notification for Individual
   */
  router.delete("/:notif_id", authenticateUser, async (req, res) => {
    try {
      const { notif_id } = req.params;
<<<<<<< HEAD
      const userId = req.user.userId;
=======
      const userId = req.user.id;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

      const deleteQuery = `
        DELETE FROM notifications
        WHERE notif_id = $1
          AND id = $2
      `;
      const { rowCount } = await pool.query(deleteQuery, [notif_id, userId]);

      if (rowCount === 0) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting notification:", error.stack || error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * 🗑️ Delete All Notifications for Individual
   */
  router.delete("/delete-all", authenticateUser, async (req, res) => {
    try {
<<<<<<< HEAD
      const userId = req.user.userId;
=======
      const userId = req.user.id;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

      const deleteQuery = `
        DELETE FROM notifications
        WHERE id = $1
      `;
      await pool.query(deleteQuery, [userId]);

      res.status(200).json({ message: "All notifications deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting all notifications:", error.stack || error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * 🔔 Emit Real-Time Notification for an Individual
   */
  const sendNotification = async (id, referenceId, type) => {
    try {
      const insertQuery = `
        INSERT INTO notifications (id, referenceId, type, is_read, created_at)
        VALUES ($1, $2, $3, false, NOW())
        RETURNING *
      `;
      const { rows } = await pool.query(insertQuery, [id, referenceId, type]);
      const newNotification = rows[0];

      io.to(id).emit("newNotification", newNotification);
      console.log(`Emitted notification to ${id}:`, newNotification);
    } catch (error) {
      console.error("❌ Error creating notification:", error.stack || error);
    }
  };

  return { router, sendNotification };
};
