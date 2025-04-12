import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SOCKET_SERVER_URL } from "../utils/apiConfig"; // Make sure this returns your WebSocket URL (e.g., "ws://192.168.0.43:5000")
import { decode as atob } from "base-64";

// Function to decode JWT token
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

let socket = null;

export const initializeSocket = async () => {
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

export const getSocket = () => socket;

export const setOffline = async () => {
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

export const disconnectSocket = () => {
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

export default socketClient;
