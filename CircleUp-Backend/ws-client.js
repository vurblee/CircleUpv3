// ws-client.js
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_SERVER_URL = "http://10.0.2.2:5000"; // Update if needed

const socket = io(SOCKET_SERVER_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
});

// On connect, join and set online
socket.on("connect", async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (userId) {
      console.log(`🟢 Connected to WebSocket as user: ${userId}`);
      socket.emit("join", userId);
      socket.emit("setOnline", userId);
    } else {
      console.warn("No userId found in AsyncStorage.");
    }
  } catch (error) {
    console.error("Error retrieving userId:", error);
  }
});

// Listen for various events
socket.on("userStatusUpdate", (status) => {
  console.log(`🔄 User ${status.userId} is now ${status.is_online ? "online" : "offline"}`);
});
socket.on("newMessage", (message) => {
  console.log("📩 New message received:", message);
});
socket.on("newNotification", (notification) => {
  console.log("🔔 New notification received:", notification);
});

// Handle disconnect
socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected from WebSocket:", reason);
});
socket.on("connect_error", (error) => {
  console.error("⚠️ WebSocket Connection Error:", error);
});

export const setOffline = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (userId) {
    socket.emit("setOffline", userId);
  }
};

// Export the socket instance
export default socket;
