import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
<<<<<<< HEAD
  Platform,
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeSocket, getSocket } from "../providers/ws-client";
<<<<<<< HEAD
import Header from "../components/header";  // <-- Import the shared Header
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

interface Notification {
  id: string;
  reference_id: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const decodeJwt = (token: string): { userId?: string; id?: string } => {
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
<<<<<<< HEAD
      console.error("Failed to decode token:", (e as Error).message);
      return {};
=======
      throw new Error("Failed to decode token: " + (e as Error).message);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  };

  const fetchNotifications = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
<<<<<<< HEAD
        navigation.navigate("SignIn");
        setLoading(false);
        return;
      }
      const response = await axios.get<Notification[]>(
        "http://192.168.1.231:5000/api/notifications",
=======
        Alert.alert("Error", "No valid token found. Please sign in again.");
        return;
      }
      console.log("Token found:", token);
      console.log("Sending GET request to /api/notifications");
      // Updated URL: using HTTP protocol and port 5000 for Android emulator
      const response = await axios.get<Notification[]>(
        "http://10.0.2.2:5000/api/notifications",
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );
<<<<<<< HEAD
      setNotifications(response.data || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
      Alert.alert("Error", "Network issue or server down. Showing empty list.");
      setNotifications([]);
    } finally {
=======
      console.log("Response status:", response.status);
      console.log("Fetched notifications:", response.data);
      setNotifications(response.data || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message);
      if (error.response) {
        console.error("Server responded with:", error.response.data);
        console.error("Status code:", error.response.status);
      } else if (error.request) {
        console.error("No response received. Check if server is running at http://10.0.2.2:5000.");
      } else {
        console.error("Request setup error:", error.message);
      }
      Alert.alert("Error", "Network issue or server down. Showing empty list.");
      setNotifications([]);
    } finally {
      console.log("Setting loading to false in fetchNotifications");
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      setLoading(false);
    }
  };

  const handlePressNotification = async (notification: Notification): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
<<<<<<< HEAD
        navigation.navigate("SignIn");
        return;
      }
      await axios.put(
        `http://192.168.1.231:5000/api/notifications/${notification.id}/read`,
=======
        Alert.alert("Error", "No valid token found.");
        return;
      }
      // Updated URL to HTTP endpoint on port 5000
      await axios.put(
        `http://10.0.2.2:5000/api/notifications/${notification.id}/read`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    } catch (error: any) {
<<<<<<< HEAD
      console.error("Error marking notification as read:", error.response?.data || error.message);
    }

    if (notification.type === "message") {
      navigation.navigate("Chat", { conversationId: notification.reference_id });
=======
      console.error("Error marking notification as read:", error);
    }

    if (notification.type === "message") {
      navigation.navigate("ChatScreen", { conversationId: notification.reference_id });
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    } else if (notification.type === "post") {
      navigation.navigate("PostScreen", { postId: notification.reference_id });
    } else if (notification.type === "event" || notification.type === "rsvp_request") {
      navigation.navigate("EventDetails", { eventId: notification.reference_id });
    } else {
      Alert.alert("Notification", "No action defined for this notification.");
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
<<<<<<< HEAD
      style={[styles.notificationContainer, item.is_read && styles.readNotification]}
      onPress={() => handlePressNotification(item)}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="notifications"
          size={30}
          color={item.is_read ? "#888" : "#668CFF"}
        />
=======
      style={styles.notificationContainer}
      onPress={() => handlePressNotification(item)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="notifications" size={30} color="#668CFF" />
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.type}</Text>
        <Text style={styles.notificationPreview} numberOfLines={1}>
          {item.reference_id}
        </Text>
      </View>
      <Text style={styles.notificationTime}>
<<<<<<< HEAD
        {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
=======
        {new Date(item.created_at).toLocaleTimeString()}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      </Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    const setupSocket = async (): Promise<void> => {
      try {
<<<<<<< HEAD
        await fetchNotifications();

        let socket = getSocket();
        if (!socket) {
=======
        console.log("Starting fetchNotifications");
        await fetchNotifications();
        console.log("fetchNotifications completed");

        let socket = getSocket();
        if (!socket) {
          console.log("Initializing socket");
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          socket = await initializeSocket();
          if (!socket) {
            console.warn("Socket initialization failed");
            return;
          }
<<<<<<< HEAD
=======
          console.log("Socket initialized in NotificationsScreen");
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        }

        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const decoded = decodeJwt(token);
          const userId = decoded.userId || decoded.id;
          if (userId) {
            socket.emit("join", userId);
            console.log("Joined room with userId:", userId);
          }
        }

        socket.on("newNotification", (notification: Notification) => {
          console.log("New notification received via socket:", notification);
          setNotifications((prev) => [notification, ...prev]);
        });

<<<<<<< HEAD
        socket.on("connect", () => console.log("🟢 Notifications socket connected"));
        socket.on("disconnect", (reason: string) => console.log("❌ Notifications socket disconnected:", reason));
        socket.on("connect_error", (error: Error) => console.error("⚠️ Notifications socket connect error:", error));
=======
        socket.on("connect", () => {
          console.log("🟢 Notifications socket connected");
        });
        socket.on("disconnect", (reason: string) => {
          console.log("❌ Notifications socket disconnected:", reason);
        });
        socket.on("connect_error", (error: Error) => {
          console.error("⚠️ Notifications socket connect error:", error);
        });
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      } catch (error: any) {
        console.error("Error setting up socket in NotificationsScreen:", error);
        setLoading(false);
      }
    };

    setupSocket();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("newNotification");
<<<<<<< HEAD
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      }
    };
  }, []);

<<<<<<< HEAD
=======
  console.log("Rendering with loading:", loading);

>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#668CFF" />
<<<<<<< HEAD
        <Text style={styles.loadingText}>Loading notifications...</Text>
=======
        <Text>Loading notifications...</Text>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      </View>
    );
  }

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      {/* Use the shared Header component */}
      <Header
        title="Notifications"
        onBackPress={() => navigation.goBack()}
        leftButtonStyle={{ marginLeft: -10 }}
        titleStyle={{ marginLeft: -10 }}
        arrowStyle={{ transform: [{ translateX: 10 }] }} // moves the back arrow 10pt to the right
      />

=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
<<<<<<< HEAD
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications available.</Text>}
=======
        ListEmptyComponent={<Text>No notifications available.</Text>}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
<<<<<<< HEAD
  loadingText: { marginTop: 10, fontSize: 16, color: "#666", fontFamily: "AirbnbCereal_Lt" },
  listContent: { padding: 10, paddingBottom: 20 },
=======
  listContent: { padding: 10 },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
<<<<<<< HEAD
  readNotification: { backgroundColor: "#f9f9f9" },
  iconContainer: { marginRight: 10 },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#333" },
  notificationPreview: { fontSize: 14, fontFamily: "AirbnbCereal_Lt", color: "#666" },
  notificationTime: { fontSize: 12, fontFamily: "AirbnbCereal_Lt", color: "#666", paddingRight: 10 },
  emptyText: { textAlign: "center", fontSize: 16, color: "#888", fontFamily: "AirbnbCereal_Lt" },
});

export default NotificationsScreen;
=======
  iconContainer: { marginRight: 10 },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: "bold" },
  notificationPreview: { fontSize: 14, color: "#666" },
  notificationTime: { fontSize: 12, color: "#666", paddingRight: 10 },
});

export default NotificationsScreen;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
