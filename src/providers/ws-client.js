const { io } = require("socket.io-client");
const AsyncStorage = require("@react-native-async-storage/async-storage").default;
<<<<<<< HEAD
const Constants = require("expo-constants");

// Function to decode JWT token
=======

>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    throw new Error("Failed to decode token: " + e.message);
  }
};

<<<<<<< HEAD
// Safely check for expoConfig and extra
const getSocketServerUrl = () => {
  if (
    Constants?.expoConfig?.extra &&
    Constants.expoConfig.extra.SOCKET_SERVER_URL
  ) {
    return Constants.expoConfig.extra.SOCKET_SERVER_URL;
  } else {
    console.warn(
      "expoConfig.extra is undefined, using fallback URL http://192.168.1.231:5000"
    );
    return "http://192.168.1.231:5000"; // fallback
  }
};

const SOCKET_SERVER_URL = getSocketServerUrl();
=======
// Updated to port 5000 for Android emulator
const SOCKET_SERVER_URL = "http://10.0.2.2:5000";
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

let socket = null;

const initializeSocket = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      console.warn("No token found in AsyncStorage; socket not initialized.");
      return null;
    }
    const decoded = decodeJwt(token);
    console.log("Decoded token:", decoded);
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      console.warn("No valid userId found in token; socket not initialized.");
      return null;
    }
    console.log("Using userId from token:", userId);

    socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      timeout: 100000,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    socket.on("connect", () => {
      console.log(`🟢 Connected to WebSocket as user: ${userId}`);
      socket.emit("join", userId);
      socket.emit("setOnline", userId);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from WebSocket:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ WebSocket Connection Error:", error);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socket.on("newNotification", (notification) => {
      console.log("🔔 New notification received:", notification);
    });

    return socket;
  } catch (error) {
    console.error("Error initializing socket:", error);
    return null;
  }
};

const getSocket = () => socket;

const setOffline = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token || !socket) return;
    const decoded = decodeJwt(token);
    const userId = decoded.userId || decoded.id;
    if (userId) {
      socket.emit("setOffline", userId);
    }
  } catch (error) {
    console.error("Error setting offline:", error);
  }
};

const disconnectSocket = () => {
  if (socket && typeof socket.disconnect === "function") {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected successfully");
  } else {
    console.warn("Socket is not initialized or disconnect is not a function.");
  }
};

const socketClient = {
  initializeSocket,
  getSocket,
  setOffline,
  disconnect: disconnectSocket,
};

module.exports = socketClient;
