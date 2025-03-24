const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const pool = require("./config/db");
const authenticateUser = require("./middleware/authMiddleware");

const app = express();
const server = http.createServer(app);

<<<<<<< HEAD
const allowedOrigins = process.env.CLIENT_URLS?.split(",") || ["*"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
=======
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8081",
      "http://10.0.2.2:5000",
      "http://10.0.2.2:19000",
      "http://10.0.2.2:8081",
      "http://192.168.1.231:8081",
    ],
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const postRoutes = require("./routes/posts")(io);
const authRoutes = require("./routes/auth");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");
const friendsRoutes = require("./routes/friends")(io);
const messageRoutes = require("./routes/messages")(io);
const conversationsRoutes = require("./routes/conversations");

app.use(express.json());
app.use(
  cors({
<<<<<<< HEAD
    origin: allowedOrigins,
=======
    origin: [
      "http://localhost:8081",
      "http://10.0.2.2:5000",
      "http://10.0.2.2:8081",
      "http://10.0.2.2:19006",
      "http://192.168.1.231:8081",
    ],
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(morgan("dev"));

<<<<<<< HEAD
app.use('/uploads', express.static("uploads"));

=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    process.exit(1);
  } else {
<<<<<<< HEAD
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Database Connected Successfully at:", res.rows[0].now);
    }
=======
    console.log("✅ Database Connected Successfully at:", res.rows[0].now);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationsRoutes);

app.get("/", (req, res) => {
  res.send("✅ CircleUp Backend is Running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running with WebSockets on port ${PORT}`);
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
<<<<<<< HEAD
});
=======
});
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
