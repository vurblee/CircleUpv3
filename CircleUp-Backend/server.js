const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const multer = require("multer");
const path = require("path");
const { Server } = require("socket.io");
require("dotenv").config();

const pool = require("./config/db");
const authenticateUser = require("./middleware/authMiddleware");

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URLS?.split(",") || ["*"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const postRoutes = require("./routes/posts")(io);
const authRoutes = require("./routes/auth");
const notificationRoutes = require("./routes/notifications")(io);
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages")(io);
const conversationsRoutes = require("./routes/conversations");
const locationsRoutes = require("./routes/locations");
const friendsRoutes = require("./routes/friends")(io);
const uploadRoutes = require("./routes/upload");

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use('/uploads', express.static("uploads"));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `banner_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Upload route
app.post("/api/upload", authenticateUser, upload.single("image"), (req, res) => {
  console.log("Upload route requested");
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `http://0.0.0.0:5000/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Test database connection on startup
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    process.exit(1);
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Database Connected Successfully at:", res.rows[0].now);
    }
  }
});

io.on("connection", (socket) => {
  console.log(`🔥 New user connected: ${socket.id}`);

  socket.on("join", (userId) => {
    socket.join(userId);
    socket.userId = userId;
    console.log(`👤 User ${userId} joined private room`);
  });

  socket.on("setOnline", async (userId) => {
    console.log(`✅ User ${userId} is online`);
    await pool.query("UPDATE users SET is_online = true WHERE id = $1", [userId]);
    io.emit("userStatusUpdate", { userId, is_online: true });
  });

  socket.on("setOffline", async (userId) => {
    console.log(`❌ User ${userId} is offline (manual)`);
    await pool.query("UPDATE users SET is_online = false WHERE id = $1", [userId]);
    io.emit("userStatusUpdate", { userId, is_online: false });
  });

  socket.on("disconnect", async () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    if (socket.userId) {
      console.log(`❌ Setting user ${socket.userId} offline on disconnect`);
      await pool.query("UPDATE users SET is_online = false WHERE id = $1", [socket.userId]);
      io.emit("userStatusUpdate", { userId: socket.userId, is_online: false });
    }
  });
});

app.use("/api/friends", friendsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes.router);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  console.log("Root route requested");
  res.send("✅ CircleUp Backend is Running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running with WebSockets on port ${PORT}`);
  console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "Yes" : "No");
  console.log("Registered routes:");
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`Route: ${r.route.path}`);
    } else if (r.name === "router" && r.handle.stack) {
      const basePath = r.regexp.toString().match(/\/[^\/]+/)[0] || "/";
      r.handle.stack.forEach((subRoute) => {
        if (subRoute.route) {
          console.log(`Route: ${basePath}${subRoute.route.path}`);
        }
      });
    }
  });
});