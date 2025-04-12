const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET /api/conversations
 * Retrieves a list of conversation records for the logged-in user.
 * Returns the conversation's UUID, last_updated, the partner's UUID, their username, and online status.
 */
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const query = `
      SELECT 
        c.conversation_id, 
        c.last_updated,
        u.id AS partner_id,
        u.username AS friend_username,
        u.is_online AS friend_online
      FROM conversations c
      JOIN conversation_participants cp1 ON cp1.conversation_id = c.conversation_id
      JOIN conversation_participants cp2 ON cp2.conversation_id = c.conversation_id AND cp2.user_id <> $1
      JOIN users u ON u.id = cp2.user_id
      WHERE cp1.user_id = $1 AND cp1.is_deleted = false
      ORDER BY c.last_updated DESC
    `;
    const result = await pool.query(query, [userId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/conversations
 * Creates or retrieves a conversation record between the logged-in user and a partner.
 * Expects: { partnerId: "UUID_OF_PARTNER" }
 * If an existing conversation is found but marked as deleted for the current user, a new conversation is created.
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { partnerId } = req.body;
    const userId = req.user.userId;
    if (!partnerId) {
      return res.status(400).json({ error: "partnerId is required." });
    }

    // Check if a conversation exists between these two users.
    const existingConvQuery = `
      SELECT c.conversation_id, c.last_updated, cp1.is_deleted AS user_deleted
      FROM conversations c
      JOIN conversation_participants cp1 ON cp1.conversation_id = c.conversation_id
      JOIN conversation_participants cp2 ON cp2.conversation_id = c.conversation_id
      WHERE cp1.user_id = $1 AND cp2.user_id = $2
      LIMIT 1
    `;
    const existing = await pool.query(existingConvQuery, [userId, partnerId]);
    if (existing.rows.length > 0 && !existing.rows[0].user_deleted) {
      // Conversation exists and is active.
      return res.status(200).json(existing.rows[0]);
    }

    // Otherwise, create a new conversation.
    // Generate a new UUID for conversation_id using uuid_generate_v4()
    const newConvQuery = `
      INSERT INTO conversations (conversation_id, last_updated)
      VALUES (uuid_generate_v4(), NOW())
      RETURNING conversation_id, last_updated
    `;
    const newConvResult = await pool.query(newConvQuery);
    const conversation = newConvResult.rows[0];

    // Insert participant records for both users.
    const participantInsertQuery = `
      INSERT INTO conversation_participants (conversation_id, user_id, is_deleted)
      VALUES ($1, $2, false), ($1, $3, false)
    `;
    await pool.query(participantInsertQuery, [conversation.conversation_id, userId, partnerId]);

    return res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/conversations/:conversationId/permanent
 * Permanently clears the conversation for the logged-in user (marks it as deleted).
 */
router.delete("/:conversationId/permanent", authenticateUser, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const updateQuery = `
      UPDATE conversation_participants
      SET is_deleted = true, deleted_at = NOW()
      WHERE conversation_id = $1 AND user_id = $2
      RETURNING *
    `;
    const updateResult = await pool.query(updateQuery, [conversationId, userId]);
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found for this user" });
    }

    return res.status(200).json({
      message: "Conversation permanently cleared for the user.",
      data: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error permanently deleting conversation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/messages/conversation/:conversationId
 * Retrieves messages for a given conversation ID, including partner info.
 */
router.get("/conversation/:conversationId", authenticateUser, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const loggedInUser = req.user.userId;

    console.log(`Fetching messages for conversationId: ${conversationId}, loggedInUser: ${loggedInUser}`);

    // Check if the conversation is marked deleted for this user.
    const cpResult = await pool.query(
      "SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
      [conversationId, loggedInUser]
    );
    if (cpResult.rows.length && cpResult.rows[0].is_deleted) {
      console.log(`Conversation ${conversationId} is deleted for user ${loggedInUser}`);
      return res.status(200).json([]);
    }

    // Ensure the conversation exists.
    const convResult = await pool.query(
      "SELECT * FROM conversations WHERE conversation_id = $1",
      [conversationId]
    );
    if (convResult.rows.length === 0) {
      console.log(`Conversation ${conversationId} does not exist`);
      return res.status(200).json([]);
    }

    // Fetch messages and partner info.
    const query = `
      SELECT 
        m.*,
        u.id AS partner_id,
        u.username AS partner_username
      FROM messages m
      LEFT JOIN conversation_participants cp 
        ON cp.conversation_id = m.conversation_id 
        AND cp.user_id != $1
      LEFT JOIN users u 
        ON u.id = cp.user_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `;
    const { rows } = await pool.query(query, [conversationId, loggedInUser]);

    if (rows.length > 0) {
      console.log(`Fetched ${rows.length} messages for conversation ${conversationId}`);
      console.log(`Partner ID: ${rows[0].partner_id}, Partner Username: ${rows[0].partner_username}`);
    } else {
      console.log(`No messages found for conversation ${conversationId}`);
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
