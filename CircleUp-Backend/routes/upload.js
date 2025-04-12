const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const pool = require("../config/db"); // Import your PostgreSQL pool
const { uploadToS3 } = require("../utils/s3"); // Import your S3 upload utility
const authenticateUser = require("../middleware/authMiddleware"); // Authentication middleware

// Configure multer for file uploads (temporary storage before S3 upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `banner_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Upload endpoint
router.post("/upload", authenticateUser, upload.single("image"), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload the file to S3
    const s3Url = await uploadToS3(req.file);
    if (!s3Url || typeof s3Url !== "string" || s3Url.trim() === "") {
      console.error("S3 URL is invalid after upload:", s3Url);
      return res.status(500).json({ error: "Failed to upload image to S3" });
    }

    // Insert the image metadata into the images table
    const userId = req.user.userId; // Get the authenticated user's ID
    const newImage = await pool.query(
      `INSERT INTO images (file_path, upload_date, is_assigned, post_id)
       VALUES ($1, NOW(), FALSE, NULL)
       RETURNING id, file_path`,
      [s3Url]
    );

    // Return the S3 URL and the image ID to the frontend
    res.status(201).json({
      message: "Image uploaded successfully",
      image_id: newImage.rows[0].id,
      url: newImage.rows[0].file_path,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;