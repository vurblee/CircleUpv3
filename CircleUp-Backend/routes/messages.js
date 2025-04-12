const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");

module.exports = (io) => {
  const router = express.Router();
  const notificationRoutes = require("./notifications")(io); // Import notifications routes

  /**
   * GET /api/messages/conversations
   * Retrieves a list of conversation summaries for the logged-in user.
   * This endpoint relies on the conversation data from the messages table.
   */
  router.get("/conversations", authenticateUser, async (req, res) => {
    try {
      const loggedInUser = req.user.userId;
      // This query uses the messages table to extract a preview,
      // but it joins with conversation_participants to ensure the conversation is active.
      const query = `
        SELECT DISTINCT ON (sub.partner_id)
          sub.conversation_id,
          sub.sender_id,
          sub.receiver_id,
          sub.content,
          sub.is_read,
          sub.created_at,
          sub.partner_id,
          u.username AS friend_username,
          u.is_online AS friend_online
        FROM (
          SELECT
            conversation_id,
            sender_id,
            receiver_id,
            content,
            is_read,
            created_at,
            CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS partner_id
          FROM messages
          WHERE sender_id = $1 OR receiver_id = $1
        ) sub
        JOIN conversation_participants cp
          ON cp.conversation_id = sub.conversation_id AND cp.user_id = $1 AND cp.is_deleted = false
        LEFT JOIN users u ON u.id = sub.partner_id
        ORDER BY sub.partner_id, sub.created_at DESC;
      `;
      const { rows } = await pool.query(query, [loggedInUser]);
      return res.status(200).json(rows);
    } catch (error) {
      console.error("Error fetching conversation list:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * GET /api/messages/conversation/:conversationId
   * Retrieves messages for a given conversation ID.
   */
  router.get("/conversation/:conversationId", authenticateUser, async (req, res) => {
    try {
      const conversationId = req.params.conversationId;
      const loggedInUser = req.user.userId;

      // Check if the conversation is marked deleted for this user.
      const cpResult = await pool.query(
        "SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
        [conversationId, loggedInUser]
      );
      if (cpResult.rows.length && cpResult.rows[0].is_deleted) {
        return res.status(200).json([]);
      }

      // Ensure the conversation exists.
      const convResult = await pool.query(
        "SELECT * FROM conversations WHERE conversation_id = $1",
        [conversationId]
      );
      if (convResult.rows.length === 0) {
        return res.status(200).json([]);
      }

      const query = `
        SELECT m.*
        FROM messages m
        WHERE m.conversation_id = $1
        ORDER BY m.created_at ASC
      `;
      const { rows } = await pool.query(query, [conversationId]);
      return res.status(200).json(rows);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * POST /api/messages
   * Sends a new message.
   * Expects: { conversation_id, receiver_id, content }
   */
  router.post("/", authenticateUser, async (req, res) => {
    try {
      const { conversation_id, receiver_id, content } = req.body;
      const sender_id = req.user.userId;
      if (!conversation_id || !receiver_id || !content) {
        return res.status(400).json({ error: "Conversation, receiver, and content are required." });
      }
      const query = `
        INSERT INTO messages (conversation_id, sender_id, receiver_id, content, is_read, created_at)
        VALUES ($1, $2, $3, $4, false, NOW()) RETURNING *
      `;
      const { rows } = await pool.query(query, [conversation_id, sender_id, receiver_id, content]);

      // Reactivate conversation for the sender if it was previously marked deleted.
      await pool.query(
        "UPDATE conversation_participants SET is_deleted = false, deleted_at = NULL WHERE conversation_id = $1 AND user_id = $2",
        [conversation_id, sender_id]
      );

      // Emit the message to the receiver
      io.to(receiver_id).emit("newMessage", rows[0]);

      // Send a notification to the receiver with the sender_id
      await notificationRoutes.sendNotification(receiver_id, conversation_id, "message", sender_id);

      return res.status(201).json({ message: "Message sent successfully", data: rows[0] });
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * PUT /api/messages/:id/read
   * Marks a message as read.
   */
  router.put("/:id/read", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const loggedInUser = req.user.userId;
      const result = await pool.query("SELECT * FROM messages WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Message not found" });
      }
      if (result.rows[0].receiver_id !== loggedInUser) {
        return res.status(403).json({ error: "You can only mark messages sent to you as read" });
      }
      await pool.query("UPDATE messages SET is_read = true WHERE id = $1", [id]);
      return res.status(200).json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * DELETE /api/messages/:id
   * Deletes a message (only the sender can delete it).
   */
  router.delete("/:id", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const loggedInUser = req.user.userId;
      const result = await pool.query("SELECT * FROM messages WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Message not found" });
      }
      if (result.rows[0].sender_id !== loggedInUser) {
        return res.status(403).json({ error: "You can only delete messages you sent" });
      }
      await pool.query("DELETE FROM messages WHERE id = $1", [id]);
      return res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * DELETE /api/messages/conversation/:conversationId/permanent
   * Permanently clears the conversation for the logged-in user by marking it as deleted.
   */
  router.delete("/conversation/:conversationId/permanent", authenticateUser, async (req, res) => {
    try {
      const conversationId = req.params.conversationId;
      const userId = req.user.userId;
      const convResult = await pool.query(
        "SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
        [conversationId, userId]
      );
      if (convResult.rows.length === 0) {
        return res.status(404).json({ error: "Conversation not found for this user" });
      }
      const updateQuery = `
        UPDATE conversation_participants
        SET is_deleted = true, deleted_at = NOW()
        WHERE conversation_id = $1 AND user_id = $2
        RETURNING *
      `;
      const updateResult = await pool.query(updateQuery, [conversationId, userId]);
      return res.status(200).json({
        message: "Conversation permanently cleared for the user.",
        data: updateResult.rows[0],
      });
    } catch (error) {
      console.error("Error permanently clearing conversation:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};