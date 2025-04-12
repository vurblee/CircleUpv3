const express = require("express");
const pool = require("../config/db");
const authenticateUser = require("../middleware/authMiddleware");
const upload = require("../middleware/multer"); // Import the shared multer setup
const { uploadToS3 } = require("../utils/s3"); // Adjust path as needed
const { s3Client, DeleteObjectCommand } = require("../config/s3Client"); // Import the S3 client and DeleteObjectCommand
const { validate: isUuid } = require("uuid");

module.exports = (io) => {
  const router = express.Router();
  const notificationRoutes = require("./notifications")(io); // Import notifications routes

  // GET all posts
  router.get("/", authenticateUser, async (req, res) => {
    try {
      const userId = req.user.userId;
      console.log(`📌 Fetching all posts for user ${userId}...`);

      const posts = await pool.query(
        `
        SELECT 
          p.id, 
          p.user_id, 
          p.title, 
          p.content, 
          p.banner_photo, 
          p.is_event,
          p.event_date, 
          p.created_at,
          p.latitude,
          p.longitude,
          u.username,
          u.profile_picture
        FROM posts p
        JOIN users u ON u.id = p.user_id
        ORDER BY p.created_at DESC
        `
      );

      console.log(`✅ Fetched ${posts.rows.length} posts for user ${userId}`);
      res.status(200).json(posts.rows);
    } catch (error) {
      console.error("Error fetching posts:", error);
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

  // POST create post with banner photo upload
  router.post("/", authenticateUser, upload.single("banner_photo"), async (req, res) => {
    try {
      const { title, content, is_event, event_date, latitude, longitude, location, state_id, city_id } = req.body;
      const userId = req.user.userId;

      if (is_event === "true" && (!latitude || !longitude || !location)) {
        return res.status(400).json({ error: "Latitude, longitude, and location are required for events" });
      }

      let bannerPhoto = null;
      if (req.file) {
        // Upload the file to S3
        bannerPhoto = await uploadToS3(req.file);
        if (!bannerPhoto || typeof bannerPhoto !== "string" || bannerPhoto.trim() === "") {
          console.error("S3 URL is invalid after upload:", bannerPhoto);
          return res.status(500).json({ error: "Failed to upload banner photo to S3" });
        }
      }

      const newPost = await pool.query(
        `INSERT INTO posts (user_id, title, content, banner_photo, is_event, event_date, latitude, longitude, location, state_id, city_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [userId, title, content, bannerPhoto, is_event === "true" ? true : false, event_date || null, latitude || null, longitude || null, location || null, state_id || null, city_id || null]
      );

      // Auto-RSVP the creator if it's an event
      if (is_event === "true") {
        await pool.query(
          `INSERT INTO rsvps (id, user_id, post_id, status, created_at)
           VALUES (gen_random_uuid(), $1, $2, 'approved', NOW())`,
          [userId, newPost.rows[0].id]
        );
        console.log(`✅ Auto-RSVP'd creator ${userId} for event ${newPost.rows[0].id}`);
      }

      // Notify friends about the new post
      const friendsQuery = `
        SELECT friend_id
        FROM friends
        WHERE user_id = $1 AND status = 'accepted'
      `;
      const { rows: friendRows } = await pool.query(friendsQuery, [userId]);
      for (const friend of friendRows) {
        const recipientId = friend.friend_id;
        await notificationRoutes.sendNotification(recipientId, newPost.rows[0].id, "post", userId);
      }

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
      const postResult = await pool.query("SELECT user_id FROM posts WHERE id = $1", [id]);
      if (postResult.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }
      const postOwnerId = postResult.rows[0].user_id;

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

      // Notify the post owner about the new comment (if the commenter is not the post owner)
      if (postOwnerId !== userId) {
        await notificationRoutes.sendNotification(
          postOwnerId, // recipientId
          id, // referenceId (the post ID)
          "comment", // type
          userId // senderId
        );
        console.log(`✅ Sent comment notification to user ${postOwnerId} for post ${id}`);
      }

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
        await notificationRoutes.sendNotification(event.rows[0].user_id, id, "rsvp_request", userId);
        console.log(`✅ Sent RSVP request notification to user ${event.rows[0].user_id} for event ${id}`);
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

      // Notify the user about the RSVP status change
      const notificationType = action === "approve" ? "rsvp_accepted" : "rsvp_denied";
      await notificationRoutes.sendNotification(
        userIdToManage, // recipientId (the user who RSVP'd)
        id, // referenceId (the event ID)
        notificationType, // type
        organizerId // senderId (the organizer)
      );
      console.log(`✅ Sent ${notificationType} notification to user ${userIdToManage} for event ${id}`);

      res.status(200).json({ message: `RSVP ${action}d` });
    } catch (error) {
      console.error("❌ Error managing RSVP:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE: Remove an attendee (RSVP) from an event (organizer only)
  router.delete("/:eventId/rsvp/:userId", authenticateUser, async (req, res) => {
    try {
      const { eventId, userId } = req.params;
      const organizerId = req.user.userId;
      
      if (!isUuid(eventId)) {
        return res.status(400).json({ error: "Invalid Event ID" });
      }
      
      const event = await pool.query(
        "SELECT user_id FROM posts WHERE id = $1 AND is_event = true",
        [eventId]
      );
      if (event.rows.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (event.rows[0].user_id !== organizerId) {
        return res.status(403).json({ error: "Only the organizer can remove attendees" });
      }
      
      const result = await pool.query(
        "DELETE FROM rsvps WHERE post_id = $1 AND user_id = $2 RETURNING *",
        [eventId, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "RSVP not found for the specified user" });
      }

      // Notify the user about being removed from the event
      await notificationRoutes.sendNotification(
        userId, // recipientId (the user being removed)
        eventId, // referenceId (the event ID)
        "rsvp_denied", // type
        organizerId // senderId (the organizer)
      );
      console.log(`✅ Sent rsvp_denied notification to user ${userId} for event ${eventId}`);

      res.status(200).json({ message: "Attendee removed from event" });
    } catch (error) {
      console.error("Error removing attendee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST like a post or event
  router.post("/:id/like", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      if (!isUuid(id)) {
        return res.status(400).json({ error: "Invalid Post ID" });
      }

      const existingLike = await pool.query(
        "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
        [id, userId]
      );

      if (existingLike.rows.length > 0) {
        return res.status(400).json({ message: "Already liked" });
      }

      const postResult = await pool.query("SELECT user_id FROM posts WHERE id = $1", [id]);
      if (postResult.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }
      const postOwnerId = postResult.rows[0].user_id;

      await pool.query(
        "INSERT INTO likes (user_id, post_id) VALUES ($1, $2)",
        [userId, id]
      );

      // Notify the post owner about the new like (if the liker is not the post owner)
      if (postOwnerId !== userId) {
        await notificationRoutes.sendNotification(
          postOwnerId, // recipientId
          id, // referenceId (the post ID)
          "like", // type
          userId // senderId
        );
        console.log(`✅ Sent like notification to user ${postOwnerId} for post ${id}`);
      }

      res.status(201).json({ message: "Post liked successfully" });
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

      await pool.query("DELETE FROM likes WHERE post_id = $1 AND user_id = $2", [id, userId]);

      res.status(204).send();
    } catch (error) {
      console.error("❌ Error removing like:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET likes for a post
  router.get("/:id/likes", async (req, res) => {
    try {
      const { id } = req.params;

      if (!isUuid(id)) {
        return res.status(400).json({ error: "Invalid Post ID" });
      }

      const likes = await pool.query(
        "SELECT COUNT(*) AS total_likes FROM likes WHERE post_id = $1",
        [id]
      );

      res.status(200).json({ total_likes: parseInt(likes.rows[0].total_likes, 10) });
    } catch (error) {
      console.error("❌ Error fetching total likes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET filter posts
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
        query += `
          JOIN friends f ON 
          (f.friend_id = p.user_id AND f.user_id = $${values.length + 1}) 
          OR (f.user_id = p.user_id AND f.friend_id = $${values.length + 1})
        `;
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

  // GET event or post details with likes, user like status, attendees, city, and state
  router.get("/:id", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      if (!isUuid(id)) {
        return res.status(400).json({ error: "Invalid Post ID" });
      }

      const post = await pool.query(
        `SELECT p.*, 
                c.name AS city_name,
                s.name AS state_name,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS total_likes,
                EXISTS (
                  SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $2
                ) AS user_liked,
                COALESCE(
                  (SELECT json_agg(
                    json_build_object(
                      'id', r.id,
                      'user_id', r.user_id,
                      'username', u.username,
                      'status', r.status
                    )
                  )
                  FROM rsvps r
                  JOIN users u ON u.id = r.user_id
                  WHERE r.post_id = p.id),
                  '[]'::json
                ) AS attendees
         FROM posts p
         LEFT JOIN cities c ON p.city_id = c.id
         LEFT JOIN states s ON p.state_id = s.id
         WHERE p.id = $1`,
        [id, userId]
      );

      if (post.rows.length === 0) {
        return res.status(404).json({ error: "Post or event not found" });
      }

      console.log(`✅ Fetched post ${id} with ${post.rows[0].attendees.length} attendees`);
      res.status(200).json(post.rows[0]);
    } catch (error) {
      console.error("❌ Error fetching post or event details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET whether the current user has liked a post or event
  router.get("/:id/user-liked", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      if (!isUuid(id)) {
        return res.status(400).json({ error: "Invalid Post ID" });
      }

      const userLiked = await pool.query(
        "SELECT EXISTS (SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2) AS user_liked",
        [id, userId]
      );

      res.status(200).json({ user_liked: userLiked.rows[0].user_liked });
    } catch (error) {
      console.error("❌ Error checking user like status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST: Upload an event photo
  router.post("/:id/photos", authenticateUser, upload.single("photo"), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { caption } = req.body;

      const event = await pool.query("SELECT user_id FROM posts WHERE id = $1", [id]);
      if (event.rows.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (event.rows[0].user_id !== userId) {
        return res.status(403).json({ error: "Unauthorized to add photos to this event" });
      }

      const photoCount = await pool.query("SELECT COUNT(*) FROM event_photos WHERE event_id = $1", [id]);
      if (parseInt(photoCount.rows[0].count, 10) >= 10) {
        return res.status(400).json({ error: "Maximum of 10 photos allowed per event" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No photo uploaded" });
      }

      const s3Url = await uploadToS3(req.file);
      if (!s3Url || typeof s3Url !== "string" || s3Url.trim() === "") {
        console.error("S3 URL is invalid after upload:", s3Url);
        return res.status(500).json({ error: "Failed to upload photo to S3" });
      }

      const result = await pool.query(
        "INSERT INTO event_photos (event_id, photo_url, caption) VALUES ($1, $2, $3) RETURNING id",
        [id, s3Url, caption || null]
      );

      res.status(201).json({
        message: "Photo added successfully",
        photo_url: s3Url,
        caption: caption || null,
        photo_id: result.rows[0].id,
      });
    } catch (error) {
      console.error("Error adding photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE: Remove a photo from an event
  router.delete("/:id/photos/:photoId", authenticateUser, async (req, res) => {
    try {
      const { id, photoId } = req.params;
      const userId = req.user.userId;

      const event = await pool.query("SELECT user_id FROM posts WHERE id = $1", [id]);
      if (event.rows.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (event.rows[0].user_id !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const photo = await pool.query(
        "SELECT photo_url FROM event_photos WHERE id = $1 AND event_id = $2",
        [photoId, id]
      );
      if (photo.rows.length === 0) {
        return res.status(404).json({ error: "Photo not found" });
      }

      const photoUrl = photo.rows[0].photo_url;
      console.log("Photo URL to delete:", photoUrl);

      const urlParts = photoUrl.match(/https:\/\/([^.]+)\.s3\.[^/]+\/(.+)/);
      if (!urlParts) {
        return res.status(400).json({ error: "Invalid photo URL format" });
      }

      const bucket = urlParts[1];
      const key = urlParts[2];
      console.log("Deleting from S3 - Bucket:", bucket, "Key:", key);

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );

      await pool.query("DELETE FROM event_photos WHERE id = $1 AND event_id = $2", [photoId, id]);

      res.status(200).json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT: Update banner photo for an event
  router.put("/:eventId/banner", authenticateUser, async (req, res) => {
    try {
      const { eventId } = req.params;
      const { banner_photo } = req.body;

      if (!isUuid(eventId)) {
        return res.status(400).json({ error: "Invalid Event ID" });
      }

      if (!banner_photo) {
        return res.status(400).json({ error: "Banner photo URL is required" });
      }

      const userId = req.user.userId;

      const event = await pool.query("SELECT user_id FROM posts WHERE id = $1", [eventId]);
      if (event.rows.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (event.rows[0].user_id !== userId) {
        return res.status(403).json({ error: "Unauthorized to update banner photo for this event" });
      }

      const updatedEvent = await pool.query(
        "UPDATE posts SET banner_photo = $1 WHERE id = $2 RETURNING *",
        [banner_photo, eventId]
      );

      res.status(200).json({
        message: "Banner photo updated successfully",
        event: updatedEvent.rows[0],
      });
    } catch (error) {
      console.error("Error updating banner photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST: Upload a photo to an event (alternative endpoint - seems redundant, keeping for compatibility)
  router.post("/:eventId/photos", authenticateUser, async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.userId;

      if (!isUuid(eventId)) {
        return res.status(400).json({ error: "Invalid Event ID" });
      }

      const event = await pool.query("SELECT * FROM posts WHERE id = $1 AND user_id = $2", [eventId, userId]);
      if (event.rows.length === 0) {
        return res.status(404).json({ error: "Event not found or unauthorized" });
      }

      const filePath = req.file.path; // Assuming multer is used
      const fileName = `photo-${Date.now()}.png`;
      const s3Url = await uploadToS3(filePath, fileName);

      await pool.query("UPDATE posts SET image = $1 WHERE id = $2", [s3Url, eventId]);

      const updatedEvent = await pool.query("SELECT * FROM posts WHERE id = $1", [eventId]);
      res.status(200).json(updatedEvent.rows[0]);
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });

  // GET photos for a specific event
  router.get("/:id/photos", async (req, res) => {
    try {
      const { id } = req.params;

      if (!isUuid(id)) {
        return res.status(400).json({ error: "Invalid Event ID" });
      }

      const photos = await pool.query("SELECT id, photo_url, caption FROM event_photos WHERE event_id = $1", [id]);
      res.status(200).json(photos.rows);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ error: "Failed to fetch photos" });
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

  // PUT: Update a post (title and/or content) - non-event posts only
  router.put("/:id", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user.userId;
      
      const postResult = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
      if (postResult.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      if (postResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: "Not authorized to update this post" });
      }
      
      if (postResult.rows[0].is_event) {
        return res.status(400).json({ error: "Cannot update event posts" });
      }
      
      const updatedTitle = title !== undefined ? title : postResult.rows[0].title;
      const updatedContent = content !== undefined ? content : postResult.rows[0].content;
      
      const updatedPost = await pool.query(
        "UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *",
        [updatedTitle, updatedContent, id]
      );
      
      res.status(200).json({ message: "Post updated successfully", post: updatedPost.rows[0] });
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT: Update an event post (title, content, location, latitude, longitude) – events only
  router.put("/:id/event", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, location, latitude, longitude } = req.body;
      const userId = req.user.userId;

      const eventResult = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
      if (eventResult.rows.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      const eventPost = eventResult.rows[0];

      if (eventPost.user_id !== userId) {
        return res.status(403).json({ error: "Not authorized to update this event" });
      }

      if (!eventPost.is_event) {
        return res.status(400).json({ error: "This is not an event post" });
      }

      const updatedTitle = title !== undefined ? title : eventPost.title;
      const updatedContent = content !== undefined ? content : eventPost.content;
      const updatedLocation = location !== undefined ? location : eventPost.location;
      const updatedLatitude = latitude !== undefined ? latitude : eventPost.latitude;
      const updatedLongitude = longitude !== undefined ? longitude : eventPost.longitude;

      const updatedEvent = await pool.query(
        `UPDATE posts 
         SET title = $1, content = $2, location = $3, latitude = $4, longitude = $5 
         WHERE id = $6 
         RETURNING *`,
        [updatedTitle, updatedContent, updatedLocation, updatedLatitude, updatedLongitude, id]
      );

      res.status(200).json({ message: "Event updated successfully", event: updatedEvent.rows[0] });
    } catch (error) {
      console.error("Error updating event:", error);
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
          await notificationRoutes.sendNotification(attendee.user_id, event.id, "event_reminder", event.user_id);
        }
      }
    } catch (error) {
      console.error("❌ Error sending event reminders:", error);
    }
  };
  setInterval(sendEventReminders, 30 * 60 * 1000);

  return router;
};