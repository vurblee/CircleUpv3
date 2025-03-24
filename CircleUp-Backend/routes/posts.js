const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");

module.exports = (io) => {
  const router = express.Router();

  // GET all posts
  router.get("/", async (req, res) => {
    try {
      console.log("📌 Fetching all posts...");
      const posts = await pool.query(
        `SELECT p.id, p.user_id, p.title, p.content, p.image, p.is_event, p.event_date, p.created_at, p.latitude, p.longitude, u.username, u.profile_picture
         FROM posts p
         JOIN users u ON u.id = p.user_id
         ORDER BY p.created_at DESC`
      );
      console.log("✅ Posts fetched:", posts.rows.length);
      res.status(200).json(posts.rows);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET search posts
  router.get("/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const posts = await pool.query(
        `SELECT p.*, u.username, u.profile_picture
         FROM posts p
         JOIN users u ON u.id = p.user_id
         WHERE p.title ILIKE $1 OR p.content ILIKE $1
         ORDER BY SIMILARITY(p.title, $1) DESC
         LIMIT 10`,
        [`%${query}%`]
      );
      res.status(200).json(posts.rows);
    } catch (error) {
      console.error("❌ Error searching posts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET nearby events
  router.get("/events/nearby", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng || !radius) {
        return res.status(400).json({ error: "Latitude, longitude, and radius are required" });
      }
      const events = await pool.query(
        `SELECT * FROM (
          SELECT p.*, u.username, u.profile_picture,
            (3959 * acos(
              cos(radians($1)) * cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians($2)) +
              sin(radians($1)) * sin(radians(p.latitude))
            )) AS distance
          FROM posts p
          JOIN users u ON u.id = p.user_id
          WHERE p.is_event = true
        ) AS subquery
        WHERE distance < $3
        ORDER BY distance ASC`,
        [lat, lng, radius]
      );
      res.status(200).json(events.rows);
    } catch (error) {
      console.error("❌ Error fetching nearby events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET upcoming events for the logged-in user
  router.get("/upcoming-events", authenticateUser, async (req, res) => {
    try {
      const userId = req.user.userId;
      console.log(`📌 Fetching upcoming events for user ${userId}...`);

      const upcomingEvents = await pool.query(
        `SELECT DISTINCT p.id, p.user_id, p.title, p.content, p.image, p.is_event, p.event_date,
                p.created_at, p.latitude, p.longitude, u.username, u.profile_picture
         FROM posts p
         JOIN users u ON u.id = p.user_id
         LEFT JOIN rsvps r ON r.post_id = p.id AND r.user_id = $1 AND r.status = 'approved'
         WHERE p.is_event = true
           AND p.event_date > NOW()
           AND (p.user_id = $1 OR r.user_id = $1)
         ORDER BY p.event_date ASC`,
        [userId]
      );

      console.log(`✅ Fetched ${upcomingEvents.rows.length} upcoming events for user ${userId}`);
      res.status(200).json(upcomingEvents.rows);
    } catch (error) {
      console.error("❌ Error fetching upcoming events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET past events for the logged-in user
  router.get("/past-events", authenticateUser, async (req, res) => {
    try {
      const userId = req.user.userId;
      console.log(`📌 Fetching past events for user ${userId}...`);

      const pastEvents = await pool.query(
        `SELECT DISTINCT p.id, p.user_id, p.title, p.content, p.image, p.is_event, p.event_date,
                p.created_at, p.latitude, p.longitude, u.username, u.profile_picture
         FROM posts p
         JOIN users u ON u.id = p.user_id
         LEFT JOIN rsvps r ON r.post_id = p.id AND r.user_id = $1 AND r.status = 'approved'
         WHERE p.is_event = true
           AND p.event_date < NOW()
           AND (p.user_id = $1 OR r.user_id = $1)
         ORDER BY p.event_date DESC`,
        [userId]
      );

      console.log(`✅ Fetched ${pastEvents.rows.length} past events for user ${userId}`);
      res.status(200).json(pastEvents.rows);
    } catch (error) {
      console.error("❌ Error fetching past events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET RSVP requests for events organized by the logged-in user
  router.get("/rsvp-requests", authenticateUser, async (req, res) => {
    try {
      const userId = req.user.userId;
      console.log(`📌 Fetching RSVP requests for events owned by user ${userId}...`);

      const rsvpRequests = await pool.query(
        `SELECT r.id AS rsvp_id,
                r.user_id AS requester_id,
                r.post_id,
                r.status,
                r.created_at,
                p.title AS event_title,
                p.event_date,
                u.username AS requester_username,
                u.profile_picture AS requester_profile
         FROM rsvps r
         JOIN posts p ON p.id = r.post_id
         JOIN users u ON u.id = r.user_id
         WHERE p.user_id = $1
           AND r.status = 'pending'
         ORDER BY r.created_at ASC`,
        [userId]
      );

      console.log(`✅ Fetched ${rsvpRequests.rows.length} RSVP requests for user ${userId}`);
      res.status(200).json(rsvpRequests.rows);
    } catch (error) {
      console.error("❌ Error fetching RSVP requests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST create post
  router.post("/", authenticateUser, async (req, res) => {
    try {
      const { title, content, image, is_event, event_date, latitude, longitude } = req.body;
      const userId = req.user.userId;
      const newPost = await pool.query(
        `INSERT INTO posts (user_id, title, content, image, is_event, event_date, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userId, title, content, image, is_event, event_date, latitude, longitude]
      );
      res.status(201).json({ message: "Post created successfully", post: newPost.rows[0] });
    } catch (error) {
      console.error("❌ Error creating post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET comments for a specific post
  router.get("/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || id === "undefined") {
        return res.status(400).json({ error: "Post ID is required" });
      }
      const comments = await pool.query(
        `SELECT c.id, c.user_id, c.post_id, c.content, c.created_at, u.username, u.profile_picture
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.post_id = $1
         ORDER BY c.created_at DESC`,
        [id]
      );
      res.status(200).json(comments.rows);
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST create a new comment for a specific post
  router.post("/:id/comments", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.userId;
      if (!id || id === "undefined") {
        return res.status(400).json({ error: "Post ID is required" });
      }
      if (!content) {
        return res.status(400).json({ error: "Comment content is required" });
      }
      const post = await pool.query("SELECT id FROM posts WHERE id = $1", [id]);
      if (post.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }
      const newComment = await pool.query(
        `INSERT INTO comments (user_id, post_id, content, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, user_id, post_id, content, created_at`,
        [userId, id, content]
      );
      const user = await pool.query("SELECT username, profile_picture FROM users WHERE id = $1", [userId]);
      const commentResponse = {
        ...newComment.rows[0],
        username: user.rows[0].username,
        profile_picture: user.rows[0].profile_picture,
      };
      res.status(201).json({
        message: "Comment added successfully",
        comment: commentResponse,
      });
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE a comment for a specific post
  router.delete("/:postId/comments/:commentId", authenticateUser, async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const result = await pool.query("DELETE FROM comments WHERE id = $1 AND post_id = $2 RETURNING *", [commentId, postId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Comment not found or you are not authorized" });
      }
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST RSVP to an event
  router.post("/:id/rsvp", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || id === "undefined") {
        console.log("❌ RSVP failed: Event ID is required");
        return res.status(400).json({ error: "Event ID is required" });
      }
      const userId = req.user.userId;
      console.log(`📌 Processing RSVP for post ${id} by user ${userId}`);
      const event = await pool.query("SELECT user_id FROM posts WHERE id = $1 AND is_event = true", [id]);
      if (event.rows.length === 0) {
        console.log("❌ RSVP failed: Event not found");
        return res.status(404).json({ error: "Event not found" });
      }
      const existingRSVP = await pool.query("SELECT * FROM rsvps WHERE post_id = $1 AND user_id = $2", [id, userId]);
      if (existingRSVP.rows.length > 0) {
        console.log("❌ RSVP failed: User already submitted an RSVP");
        return res.status(400).json({ message: "RSVP request already submitted" });
      }
      await pool.query("INSERT INTO rsvps (user_id, post_id, status) VALUES ($1, $2, 'pending')", [userId, id]);
      if (event.rows[0].user_id !== userId) {
        const notification = await pool.query(
          `INSERT INTO notifications (id, user_id, reference_id, type, is_read, created_at)
           VALUES (gen_random_uuid(), $1, $2, 'rsvp_request', false, NOW()) RETURNING *`,
          [event.rows[0].user_id, id]
        );
        io.to(event.rows[0].user_id).emit("newNotification", notification.rows[0]);
      }
      console.log("✅ RSVP request sent successfully");
      res.status(201).json({ message: "RSVP request sent" });
    } catch (error) {
      console.error("❌ Error requesting RSVP:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET RSVP status
  router.get("/:id/rsvp", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || id === "undefined") {
        return res.status(400).json({ error: "Event ID is required" });
      }
      const userId = req.user.userId;
      const rsvp = await pool.query("SELECT status FROM rsvps WHERE post_id = $1 AND user_id = $2", [id, userId]);
      res.status(200).json({ status: rsvp.rows.length > 0 ? rsvp.rows[0].status : null });
    } catch (error) {
      console.error("❌ Error fetching RSVP status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST manage RSVP (approve/deny)
  router.post("/:id/rsvp/manage", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || id === "undefined") {
        return res.status(400).json({ error: "Event ID is required" });
      }
      const { userIdToManage, action } = req.body;
      const organizerId = req.user.userId;
      const event = await pool.query("SELECT user_id FROM posts WHERE id = $1 AND is_event = true", [id]);
      if (event.rows.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (event.rows[0].user_id !== organizerId) {
        return res.status(403).json({ error: "Only the organizer can manage RSVPs" });
      }
      await pool.query(
        "UPDATE rsvps SET status = $1 WHERE post_id = $2 AND user_id = $3",
        [action === "approve" ? "approved" : "denied", id, userIdToManage]
      );
      res.status(200).json({ message: `RSVP ${action}d` });
    } catch (error) {
      console.error("❌ Error managing RSVP:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST like a post
  router.post("/:id/like", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || id === "undefined") {
        return res.status(400).json({ error: "Post ID is required" });
      }
      const userId = req.user.userId;
      const existingLike = await pool.query("SELECT * FROM likes WHERE post_id = $1 AND user_id = $2", [id, userId]);
      if (existingLike.rows.length > 0) {
        return res.status(400).json({ message: "Already liked" });
      }
      await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [userId, id]);
      res.status(201).json({ message: "Post liked" });
    } catch (error) {
      console.error("❌ Error liking post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE a like for a post
  router.delete("/:id/like", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const result = await pool.query(
        "DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING *",
        [id, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Like not found" });
      }
      res.status(200).json({ message: "Like removed" });
    } catch (error) {
      console.error("❌ Error removing like:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET likes for a post
  router.get("/:id/likes", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || id === "undefined") {
        return res.status(400).json({ error: "Post ID is required" });
      }
      const likes = await pool.query("SELECT COUNT(*) as like_count FROM likes WHERE post_id = $1", [id]);
      res.status(200).json({ like_count: parseInt(likes.rows[0].like_count, 10) });
    } catch (error) {
      console.error("❌ Error fetching likes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================
  // NEW ROUTE: FILTER POSTS
  // ============================
  // This route must be declared BEFORE any route that uses "/:id"
  router.get("/filter", authenticateUser, async (req, res) => {
    try {
      console.log("📌 Filtering posts...");
      const currentUserId = req.user.userId;
      const { friendsOnly, startDate, endDate, eventType } = req.query;

      let query = `
        SELECT p.id, p.user_id, p.title, p.content, p.image, p.is_event, p.event_date,
               p.created_at, p.latitude, p.longitude, u.username, u.profile_picture
        FROM posts p
        JOIN users u ON u.id = p.user_id
      `;
      const whereClauses = [];
      const values = [];

      if (friendsOnly === "true") {
        query += ` JOIN friends f ON f.friend_id = p.user_id `;
        whereClauses.push(`f.user_id = $${values.length + 1}`);
        values.push(currentUserId);
        whereClauses.push(`f.status = 'accepted'`);
      }

      if (startDate) {
        whereClauses.push(`p.created_at >= $${values.length + 1}`);
        values.push(startDate);
      }
      if (endDate) {
        whereClauses.push(`p.created_at <= $${values.length + 1}`);
        values.push(endDate);
      }

      if (eventType === "true") {
        whereClauses.push("p.is_event = true");
      } else if (eventType === "false") {
        whereClauses.push("p.is_event = false");
      }

      if (whereClauses.length > 0) {
        query += " WHERE " + whereClauses.join(" AND ");
      }

      query += " ORDER BY p.created_at DESC";
      const filteredPosts = await pool.query(query, values);
      console.log(`✅ Filtered posts: ${filteredPosts.rows.length}`);
      res.status(200).json(filteredPosts.rows);
    } catch (error) {
      console.error("❌ Error filtering posts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET single post (placed after the filter route to avoid conflicts)
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || id === "undefined") {
        return res.status(400).json({ error: "Post ID is required" });
      }
      const post = await pool.query(
        `SELECT p.*, u.username, u.profile_picture
         FROM posts p
         JOIN users u ON u.id = p.user_id
         WHERE p.id = $1`,
        [id]
      );
      const attendees = await pool.query(
        `SELECT r.user_id, u.username, u.profile_picture, r.status
         FROM rsvps r
         JOIN users u ON u.id = r.user_id
         WHERE r.post_id = $1`,
        [id]
      );
      if (post.rows.length === 0)
        return res.status(404).json({ error: "Post not found" });
      res.status(200).json({ ...post.rows[0], attendees: attendees.rows });
    } catch (error) {
      console.error("❌ Error fetching post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE post
  router.delete("/:id", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const postResult = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
      if (postResult.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }
      if (postResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this post" });
      }
      await pool.query("DELETE FROM posts WHERE id = $1", [id]);
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Event reminders
  const sendEventReminders = async () => {
    try {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const events = await pool.query(
        `SELECT * FROM posts
         WHERE is_event = true AND event_date BETWEEN NOW() AND $1`,
        [now]
      );
      for (const event of events.rows) {
        const attendees = await pool.query(
          `SELECT user_id FROM rsvps WHERE post_id = $1 AND status = 'approved'`,
          [event.id]
        );
        for (const attendee of attendees.rows) {
          await pool.query(
            `INSERT INTO notifications (user_id, reference_id, type, is_read, created_at)
             VALUES ($1, $2, 'event_reminder', false, NOW())`,
            [attendee.user_id, event.id]
          );
          io.to(attendee.user_id).emit("newNotification", {
            type: "event_reminder",
            message: `Reminder: ${event.title} starts soon!`,
            event_id: event.id,
          });
        }
      }
    } catch (error) {
      console.error("❌ Error sending event reminders:", error);
    }
  };
  setInterval(sendEventReminders, 30 * 60 * 1000);

  return router;
};
