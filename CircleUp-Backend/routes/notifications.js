const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");

// Helper function to validate UUID strings
const isValidUuid = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

module.exports = (io) => {
  const router = express.Router();

  /**
   * GET /api/notifications/health
   * Test route to verify the server is alive.
   */
  router.get("/health", (req, res) => {
    console.log("Route: Health check requested");
    res.status(200).json({ message: "Backend is running on port 5000" });
  });

  /**
   * GET /api/notifications/db-test
   * Test the database connection by fetching the current timestamp.
   */
  router.get("/db-test", async (req, res) => {
    console.log("Route: Database test requested");
    try {
      const { rows } = await pool.query("SELECT NOW()");
      res.status(200).json({ time: rows[0].now });
    } catch (error) {
      console.error("Route: DB connection error:", error.stack);
      res.status(500).json({ error: "Database connection failed", details: error.message });
    }
  });

  /**
   * GET /api/notifications/auth-test
   * Test the authentication middleware.
   */
  router.get("/auth-test", authenticateUser, (req, res) => {
    console.log("Route: Auth test requested");
    try {
      const userId = req.user.userId;
      console.log("Route: Auth test userId:", userId);
      res.status(200).json({ userId, message: "Authentication successful" });
    } catch (error) {
      console.error("Route: Auth test error:", error.stack);
      res.status(500).json({ error: "Authentication test failed", details: error.message });
    }
  });

  /**
   * GET /api/notifications
   * Fetch all notifications for the logged-in user, sorted with unread first.
   * Returns up to 50 notifications.
   */
  router.get("/", authenticateUser, async (req, res) => {
    console.log("Route: Notifications fetch requested");
    try {
      const userId = req.user.userId;
      console.log(`Route: Fetching notifications for recipient_id: ${userId}`);

      const query = `
        SELECT n.*, COALESCE(u.username, 'System') AS sender_username
        FROM notifications n
        LEFT JOIN users u ON n.sender_id = u.id
        WHERE n.recipient_id = $1
        ORDER BY n.is_read, n.created_at DESC
        LIMIT 50
      `;
      const start = Date.now();
      const { rows } = await pool.query(query, [userId]);
      console.log(`Route: Fetched ${rows.length} notifications in ${Date.now() - start}ms`);
      rows.forEach((notif) => {
        console.log(`Notification ID: ${notif.id}, Sender ID: ${notif.sender_id}, Sender Username: ${notif.sender_username}, Type: ${notif.type}`);
      });
      res.status(200).json(rows);
    } catch (error) {
      console.error("Route: ❌ Error fetching notifications:", error.stack || error);
      res.status(500).json({ error: "Failed to fetch notifications", details: error.message });
    }
  });

  /**
   * GET /api/notifications/unread
   * Fetch unread notifications for the logged-in user.
   * Returns up to 50 notifications.
   */
  router.get("/unread", authenticateUser, async (req, res) => {
    console.log("Route: Unread notifications fetch requested");
    try {
      const userId = req.user.userId;
      const query = `
        SELECT n.*, COALESCE(u.username, 'System') AS sender_username
        FROM notifications n
        LEFT JOIN users u ON n.sender_id = u.id
        WHERE n.recipient_id = $1
          AND n.is_read = false
        ORDER BY n.created_at DESC
        LIMIT 50
      `;
      const { rows } = await pool.query(query, [userId]);
      rows.forEach((notif) => {
        console.log(`Unread Notification ID: ${notif.id}, Sender ID: ${notif.sender_id}, Sender Username: ${notif.sender_username}, Type: ${notif.type}`);
      });
      res.status(200).json(rows);
    } catch (error) {
      console.error("Route: ❌ Error fetching unread notifications:", error.stack || error);
      res.status(500).json({ error: "Failed to fetch unread notifications", details: error.message });
    }
  });

  /**
   * PUT /api/notifications/:id/read
   * Mark a specific notification as read for the logged-in user.
   */
  router.put("/:id/read", authenticateUser, async (req, res) => {
    console.log("Route: Mark notification as read requested");
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      if (!id || !isValidUuid(id)) {
        return res.status(400).json({ error: "Invalid notification ID" });
      }

      const updateQuery = `
        UPDATE notifications
        SET is_read = true
        WHERE id = $1
          AND recipient_id = $2
        RETURNING *
      `;
      const { rowCount, rows } = await pool.query(updateQuery, [id, userId]);

      if (rowCount === 0) {
        return res.status(404).json({ error: "Notification not found or you are not authorized to mark it as read" });
      }

      res.status(200).json({ message: "Notification marked as read", data: rows[0] });
    } catch (error) {
      console.error("Route: ❌ Error marking notification as read:", error.stack || error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  /**
   * PUT /api/notifications/mark-all-read
   * Mark all notifications as read for the logged-in user.
   */
  router.put("/mark-all-read", authenticateUser, async (req, res) => {
    console.log("Route: Mark all notifications as read requested");
    try {
      const userId = req.user.userId;

      const updateQuery = `
        UPDATE notifications
        SET is_read = true
        WHERE recipient_id = $1
      `;
      await pool.query(updateQuery, [userId]);

      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Route: ❌ Error marking all notifications as read:", error.stack || error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  /**
   * DELETE /api/notifications/:id
   * Delete a specific notification for the logged-in user.
   */
  router.delete("/:id", authenticateUser, async (req, res) => {
    console.log("Route: Delete notification requested");
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      if (!id || !isValidUuid(id)) {
        return res.status(400).json({ error: "Invalid notification ID" });
      }

      const deleteQuery = `
        DELETE FROM notifications
        WHERE id = $1
          AND recipient_id = $2
      `;
      const { rowCount } = await pool.query(deleteQuery, [id, userId]);

      if (rowCount === 0) {
        return res.status(404).json({ error: "Notification not found or you are not authorized to delete it" });
      }

      res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Route: ❌ Error deleting notification:", error.stack || error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  /**
   * DELETE /api/notifications/delete-all
   * Delete all notifications for the logged-in user.
   */
  router.delete("/delete-all", authenticateUser, async (req, res) => {
    console.log("Route: Delete all notifications requested");
    try {
      const userId = req.user.userId;

      const deleteQuery = `
        DELETE FROM notifications
        WHERE recipient_id = $1
      `;
      await pool.query(deleteQuery, [userId]);

      res.status(200).json({ message: "All notifications deleted successfully" });
    } catch (error) {
      console.error("Route: ❌ Error deleting all notifications:", error.stack || error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  /**
   * Send a real-time notification to a user.
   * @param recipientId - The ID of the user to receive the notification.
   * @param referenceId - The ID of the related entity (e.g., conversation, post).
   * @param type - The type of notification (e.g., "message", "friend_request").
   * @param senderId - The ID of the user sending the notification.
   * @param message - Optional custom message for the notification.
   */
  const sendNotification = async (recipientId, referenceId, type, senderId, message = null) => {
    try {
      console.log(`Attempting to send notification - Type: ${type}, Recipient ID: ${recipientId}, Sender ID: ${senderId}, Reference ID: ${referenceId}, Message: ${message}`);

      // Validate recipientId
      if (!recipientId || !isValidUuid(recipientId)) {
        console.error(`Invalid recipient ID: ${recipientId}`);
        return; // Skip sending the notification
      }

      // Validate senderId (allow null for system notifications, but log a warning if null for user actions)
      if (!senderId && type !== "system") {
        console.warn(`Sender ID is null for notification type: ${type}. This might cause issues with sender_username.`);
      } else if (senderId && !isValidUuid(senderId)) {
        console.error(`Invalid sender ID: ${senderId}`);
        return; // Skip sending the notification
      }

      // Verify that recipientId exists in the users table
      const userCheck = await pool.query("SELECT 1 FROM users WHERE id = $1", [recipientId]);
      if (userCheck.rows.length === 0) {
        console.error(`Recipient ID ${recipientId} does not exist in users table`);
        return; // Skip sending the notification
      }

      // Fetch sender's username for the notification message
      let senderUsername = "System";
      if (senderId) {
        const senderQuery = `
          SELECT username FROM users WHERE id = $1
        `;
        const senderResult = await pool.query(senderQuery, [senderId]);
        if (senderResult.rows.length > 0) {
          senderUsername = senderResult.rows[0].username;
        } else {
          console.warn(`Sender ID ${senderId} not found in users table, using default username: ${senderUsername}`);
        }
      }

      const insertQuery = `
        INSERT INTO notifications (recipient_id, reference_id, type, sender_id, message, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, false, NOW())
        RETURNING *
      `;
      const { rows } = await pool.query(insertQuery, [recipientId, referenceId, type, senderId, message]);
      const newNotification = rows[0];

      console.log(`Notification created - ID: ${newNotification.id}, Type: ${newNotification.type}, Recipient: ${recipientId}, Sender: ${senderId}, Sender Username: ${senderUsername}`);

      // Emit the notification with the sender's username
      const notificationWithSender = { ...newNotification, sender_username: senderUsername };
      io.to(recipientId).emit("newNotification", notificationWithSender);
      console.log(`Route: Emitted notification to ${recipientId}:`, notificationWithSender);
    } catch (error) {
      console.error("Route: ❌ Error creating notification:", error.stack || error);
    }
  };

  /**
   * POST /api/notifications/test-notif
   * Test endpoint for sending a notification to the logged-in user.
   */
  router.post("/test-notif", authenticateUser, async (req, res) => {
    console.log("Route: Test notification requested");
    try {
      const userId = req.user.userId;
      const senderId = req.user.userId; // For testing, use the same user as sender
      await sendNotification(userId, "test-ref-id", "test", senderId, "This is a test notification");
      res.status(200).json({ message: "Test notification sent" });
    } catch (error) {
      console.error("Route: ❌ Error sending test notification:", error.stack || error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  /**
   * POST /api/notifications
   * Create a new notification (used for profile sharing in FriendsScreen).
   */
  router.post("/", authenticateUser, async (req, res) => {
    console.log("Route: Create notification requested");
    try {
      const { user_id, type, message, related_id } = req.body;
      const senderId = req.user.userId;

      if (!user_id || !type || !related_id) {
        return res.status(400).json({ error: "user_id, type, and related_id are required" });
      }

      if (!isValidUuid(user_id) || !isValidUuid(related_id)) {
        return res.status(400).json({ error: "Invalid user_id or related_id" });
      }

      await sendNotification(user_id, related_id, type, senderId, message);
      res.status(201).json({ message: "Notification created successfully" });
    } catch (error) {
      console.error("Route: ❌ Error creating notification:", error.stack || error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  return { router, sendNotification };
};