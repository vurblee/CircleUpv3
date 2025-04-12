import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeSocket, getSocket } from "../providers/ws-client";
import { useNotification } from "../contexts/NotificationContext";
import Header from "../components/header";
import apiClient from "../api/apiClient";

interface Notification {
  id: string;
  reference_id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  sender_id?: string;
  sender_username?: string;
  message?: string; // Added message property
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showNotification } = useNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotif, setNewNotif] = useState<Notification | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedNotifs, setSelectedNotifs] = useState<Set<string>>(new Set());

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
      console.error("Failed to decode token:", (e as Error).message);
      return {};
    }
  };

  const fetchNotifications = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.log("No token found, navigating to SignIn");
        navigation.navigate("SignIn");
        return;
      }
      console.log("Fetching notifications with token:", token);
      const response = await apiClient.get<Notification[]>("/notifications", {
        timeout: 10000,
      });
      console.log("Fetched notifications:", response.data);
      // Log sender_username for each notification to debug
      response.data.forEach((notif: Notification) => {
        console.log(`Notification ID: ${notif.id}, Sender Username: ${notif.sender_username}, Sender ID: ${notif.sender_id}`);
      });
      setNotifications(response.data || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
      setError(
        error.response?.data?.error || "Failed to load notifications. Please try again."
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put("/notifications/mark-all-read", {});
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to mark all notifications as read. Please try again.");
    }
  };

  const handlePressNotification = async (notification: Notification): Promise<void> => {
    if (editMode) {
      const newSelected = new Set(selectedNotifs);
      if (newSelected.has(notification.id)) {
        newSelected.delete(notification.id);
      } else {
        newSelected.add(notification.id);
      }
      setSelectedNotifs(newSelected);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      if (!notification.is_read) {
        await apiClient.put(`/notifications/${notification.id}/read`, {});
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }
    } catch (error: any) {
      console.error("Error marking notification as read:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to mark notification as read. Please try again.");
    }

    // Navigation logic based on notification type
    switch (notification.type) {
      case "message":
      case "conversation":
        if (!notification.sender_id) {
          console.error("No sender_id found in notification:", notification);
          Alert.alert("Error", "Cannot open chat: Sender information is missing.");
          return;
        }
        navigation.navigate("ChatScreen", {
          conversationId: notification.reference_id,
          partnerId: notification.sender_id,
          partnerName: notification.sender_username,
        });
        break;
      case "post":
      case "comment": // Navigate to PostScreen for comments
      case "like":   // Navigate to PostScreen for likes
        navigation.navigate("PostScreen", { postId: notification.reference_id });
        break;
      case "event":
      case "event_reminder":
      case "rsvp_request":
      case "rsvp_accepted": // Navigate to EventDetails for RSVP status updates
      case "rsvp_denied":   // Navigate to EventDetails for RSVP status updates
        navigation.navigate("EventDetails", { eventId: notification.reference_id });
        break;
      case "friend_request":
      case "friend_accepted":
        if (notification.sender_id) {
          navigation.navigate("UserProfile", { userId: notification.sender_id });
        } else {
          Alert.alert("Notification", "Sender information not available.");
        }
        break;
      default:
        Alert.alert("Notification", "No action defined for this notification type.");
    }
  };

  const handleDeleteNotifications = async () => {
    Alert.alert(
      "Delete Notifications",
      "Are you sure you want to delete the selected notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              for (const notifId of selectedNotifs) {
                await apiClient.delete(`/notifications/${notifId}`);
              }
              setNotifications((prev) =>
                prev.filter((notif) => !selectedNotifs.has(notif.id))
              );
              setSelectedNotifs(new Set());
              setEditMode(false);
            } catch (error: any) {
              console.error("Error deleting notifications:", error.response?.data || error.message);
              Alert.alert("Error", "Failed to delete notifications. Please try again.");
            }
          },
        },
      ]
    );
  };

  const getNotificationMessage = (notification: Notification): string => {
    switch (notification.type) {
      case "message":
      case "conversation":
        return `${notification.sender_username || "Someone"} sent you a message`;
      case "post":
        return `${notification.sender_username || "Someone"} created a new post`;
      case "event":
        return `${notification.sender_username || "Someone"} created a new event`;
      case "event_reminder":
        return `Reminder: An event you RSVP'd to is starting soon`;
      case "friend_request":
        return `${notification.sender_username || "Someone"} sent you a friend request`;
      case "friend_accepted":
        return `${notification.sender_username || "Someone"} accepted your friend request`;
      case "rsvp_request":
        return `${notification.sender_username || "Someone"} requested to RSVP to your event`;
      // New notification types
      case "comment":
        return `${notification.sender_username || "Someone"} commented on your post`;
      case "like":
        return `${notification.sender_username || "Someone"} liked your post`;
      case "rsvp_accepted":
        return `${notification.sender_username || "The organizer"} accepted your RSVP request`;
      case "rsvp_denied":
        return `${notification.sender_username || "The organizer"} denied your RSVP request`;
      default:
        return "You have a new notification";
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const isSelected = selectedNotifs.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.notificationContainer, item.is_read && styles.readNotification]}
        onPress={() => handlePressNotification(item)}
        onLongPress={() => {
          if (!editMode) {
            setEditMode(true);
            setSelectedNotifs(new Set([item.id]));
          }
        }}
      >
        {editMode && <Text style={styles.checkbox}>{isSelected ? "[✓]" : "[ ]"}</Text>}
        <View style={styles.iconContainer}>
          <Ionicons
            name="notifications"
            size={30}
            color={item.is_read ? "#888" : "#668CFF"}
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{getNotificationMessage(item)}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.created_at).toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNewNotificationBanner = () => {
    if (!newNotif) return null;
    return (
      <View style={styles.banner}>
        <Text style={styles.bannerText}>{getNotificationMessage(newNotif)}</Text>
      </View>
    );
  };

  useEffect(() => {
    const setupSocket = async (): Promise<void> => {
      try {
        let socket = getSocket();
        if (!socket) {
          socket = await initializeSocket();
          if (!socket) throw new Error("Socket initialization failed");
        }

        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const decoded = decodeJwt(token);
          const userId = decoded.id || decoded.userId;
          if (userId) {
            socket.emit("join", userId);
            console.log("Joined room with userId:", userId);
            await fetchNotifications();
          }
        }

        socket.on("newNotification", (notification: Notification) => {
          console.log("New notification received via socket:", notification);
          setNotifications((prev) => [notification, ...prev]);
          showNotification(notification.message || getNotificationMessage(notification));
          showNotification(notification.message || "You have a new notification");
          setTimeout(() => setNewNotif(null), 3000);
        });

        socket.on("connect", () => console.log("🟢 Notifications socket connected"));
        socket.on("disconnect", (reason: string) => console.log("❌ Notifications socket disconnected:", reason));
        socket.on("connect_error", (error: Error) => console.error("⚠️ Notifications socket connect error:", error));
      } catch (error: any) {
        console.error("Error setting up socket in NotificationsScreen:", error);
        setError("Failed to connect to notifications service.");
        setLoading(false);
      }
    };

    setupSocket();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("newNotification");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#668CFF" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        onBackPress={() => navigation.goBack()}
        leftButtonStyle={{ marginLeft: 0 }}
        titleStyle={{ marginLeft: "auto", marginRight: "auto" }} // Center the title
        arrowStyle={{ transform: [{ translateX: 10 }] }}
        rightComponent={
          editMode ? (
            <View style={styles.headerColumnContainerLeft}>
              <TouchableOpacity style={styles.headerButton} onPress={handleDeleteNotifications}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={markAllAsRead}>
                <Text style={styles.headerButtonText}>Mark All as Read</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  setEditMode(false);
                  setSelectedNotifs(new Set());
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.headerColumnContainerRight}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  setEditMode(true);
                  setSelectedNotifs(new Set());
                }}
              >
                <Text style={styles.headerButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
      {renderNewNotificationBanner()}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchNotifications} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666", fontFamily: "AirbnbCereal_Lt" },
  listContent: { padding: 10, paddingBottom: 20 },
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  readNotification: { backgroundColor: "#f9f9f9" },
  iconContainer: { marginRight: 10 },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#333" },
  notificationTime: { fontSize: 12, fontFamily: "AirbnbCereal_Lt", color: "#666" },
  emptyText: { textAlign: "center", fontSize: 16, color: "#888", fontFamily: "AirbnbCereal_Lt" },
  banner: {
    position: "absolute",
    top: 60,
    left: 10,
    right: 10,
    backgroundColor: "#668CFF",
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  bannerText: { color: "#fff", textAlign: "center", fontFamily: "AirbnbCereal_Md" },
  errorContainer: { padding: 10, alignItems: "center" },
  errorText: { color: "red", fontSize: 16, fontFamily: "AirbnbCereal_Lt" },
  retryButton: { marginTop: 10, padding: 10, backgroundColor: "#668CFF", borderRadius: 5 },
  retryText: { color: "#fff", fontFamily: "AirbnbCereal_Md" },
  headerColumnContainerLeft: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 0,
  },
  headerColumnContainerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Move the Edit button to the right
    marginRight: 10,
  },
  headerButton: {
    paddingVertical: 5,
    marginVertical: 2,
    paddingHorizontal: 5,
  },
  headerButtonText: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    color: "#000",
    flexShrink: 0,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    color: "red",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    color: "#000",
  },
  checkbox: {
    fontSize: 18,
    marginRight: 8,
    color: "#000",
  },
});

export default NotificationsScreen;