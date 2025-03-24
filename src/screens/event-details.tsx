import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  SectionList,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const EventDetails: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { eventId, event: eventFromRoute } = route.params || {};
  const [event, setEvent] = useState<any>(eventFromRoute || null);
  const [loading, setLoading] = useState(!eventFromRoute);
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const loadCurrentUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      setCurrentUserId(storedUserId);
    } catch (error) {
      console.error("Error loading current user id:", error);
<<<<<<< HEAD
      Alert.alert("Error", "Could not load user information.");
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  };

  const fetchEventDetails = async () => {
    if (!eventId) {
      Alert.alert("Error", "Event ID is missing.");
      setLoading(false);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      if (!token) {
        navigation.navigate("SignIn");
        setLoading(false);
        return;
      }
      const response = await axios.get(`http://192.168.1.231:5000/api/posts/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(response.data || {});
      setAttendees(response.data.attendees || []);
      setLikeCount(response.data.like_count || 0);
      setLiked(response.data.user_liked || false);
=======
      const response = await axios.get(`http://10.0.2.2:5000/api/posts/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(response.data);
      setAttendees(response.data.attendees || []);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    } catch (error: any) {
      console.error("Error fetching event details:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not fetch event details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRSVPStatus = async () => {
    if (!eventId) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      if (!token) return;
      const response = await axios.get(`http://192.168.1.231:5000/api/posts/${eventId}/rsvp`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRsvpStatus(response.data.status || null);
    } catch (error: any) {
      console.error("Error fetching RSVP status:", error.response?.data || error.message);
=======
      const response = await axios.get(`http://10.0.2.2:5000/api/posts/${eventId}/rsvp`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRsvpStatus(response.data.status);
    } catch (error) {
      console.error("Error fetching RSVP status:", error);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  };

  const fetchComments = async () => {
    if (!eventId) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      if (!token) return;
      const response = await axios.get(`http://192.168.1.231:5000/api/posts/${eventId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data || []);
=======
      const response = await axios.get(`http://10.0.2.2:5000/api/posts/${eventId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    } catch (error: any) {
      console.error("Error fetching comments:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not fetch comments.");
    }
  };

<<<<<<< HEAD
=======
  const fetchLikes = async () => {
    if (!eventId) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`http://10.0.2.2:5000/api/posts/${eventId}/likes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikeCount(response.data.like_count);
      setLiked(response.data.user_liked || false); // Assuming API provides this
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Error", "Comment cannot be empty.");
      return;
    }
    setCommentLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
<<<<<<< HEAD
        navigation.navigate("SignIn");
        return;
      }
      const response = await axios.post(
        `http://192.168.1.231:5000/api/posts/${eventId}/comments`,
=======
        Alert.alert("Error", "Please log in to comment.");
        return;
      }
      const response = await axios.post(
        `http://10.0.2.2:5000/api/posts/${eventId}/comments`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([response.data.comment, ...comments]);
      setNewComment("");
      Alert.alert("Success", "Comment added successfully!");
    } catch (error: any) {
      console.error("Error adding comment:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not add comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
<<<<<<< HEAD
              navigation.navigate("SignIn");
              return;
            }
            await axios.delete(`http://192.168.1.231:5000/api/posts/${eventId}/comments/${commentId}`, {
=======
              Alert.alert("Error", "Please log in to delete comments.");
              return;
            }
            await axios.delete(`http://10.0.2.2:5000/api/posts/${eventId}/comments/${commentId}`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              headers: { Authorization: `Bearer ${token}` },
            });
            setComments(comments.filter((comment) => comment.id !== commentId));
            Alert.alert("Success", "Comment deleted successfully!");
          } catch (error: any) {
            console.error("Error deleting comment:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "Could not delete comment.");
          }
        },
      },
    ]);
  };

  const handleLike = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      if (liked) {
        await axios.delete(`http://192.168.1.231:5000/api/posts/${eventId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLiked(false);
        setLikeCount(likeCount - 1);
        Alert.alert("Success", "Event unliked!");
      } else {
        await axios.post(
          `http://192.168.1.231:5000/api/posts/${eventId}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLiked(true);
        setLikeCount(likeCount + 1);
        Alert.alert("Success", "Event liked!");
      }
    } catch (error: any) {
      console.error("Error toggling like:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Could not toggle like.");
=======
      await axios.post(
        `http://10.0.2.2:5000/api/posts/${eventId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(true);
      setLikeCount(likeCount + 1);
      Alert.alert("Success", "Event liked!");
    } catch (error: any) {
      console.error("Error liking event:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Could not like event.");
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  };

  const handleRSVP = async () => {
    if (!eventId) {
      Alert.alert("Error", "Event ID is missing.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
<<<<<<< HEAD
        navigation.navigate("SignIn");
        return;
      }
      const response = await axios.post(
        `http://192.168.1.231:5000/api/posts/${eventId}/rsvp`,
=======
        Alert.alert("Error", "Authentication token is missing. Please log in.");
        return;
      }
      const response = await axios.post(
        `http://10.0.2.2:5000/api/posts/${eventId}/rsvp`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRsvpStatus(response.data.status || "pending");
      Alert.alert("Success", "RSVP request sent!");
      fetchEventDetails();
    } catch (error: any) {
      console.error("RSVP error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not send RSVP.");
    }
  };

  const handleManageRSVP = async (userId: string, action: "approve" | "deny") => {
    if (!eventId) {
      Alert.alert("Error", "Event ID is missing.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      await axios.post(
        `http://192.168.1.231:5000/api/posts/${eventId}/rsvp/manage`,
=======
      await axios.post(
        `http://10.0.2.2:5000/api/posts/${eventId}/rsvp/manage`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        { userIdToManage: userId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", `RSVP ${action}d`);
      fetchEventDetails();
    } catch (error: any) {
      console.error("Error managing RSVP:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || `Could not ${action} RSVP.`);
    }
  };

  const handleDeletePost = async () => {
    if (!eventId) {
      Alert.alert("Error", "Event ID is missing.");
      return;
    }
    Alert.alert("Confirm Delete", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
            if (!token) {
              navigation.navigate("SignIn");
              return;
            }
            await axios.delete(`http://192.168.1.231:5000/api/posts/${eventId}`, {
=======
            await axios.delete(`http://10.0.2.2:5000/api/posts/${eventId}`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Success", "Event deleted successfully!");
            navigation.goBack();
          } catch (error: any) {
            console.error("Error deleting event:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "Could not delete event.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
<<<<<<< HEAD
    const fetchData = async () => {
      if (!eventFromRoute) await fetchEventDetails();
      await Promise.all([loadCurrentUserId(), fetchRSVPStatus(), fetchComments()]);
    };
    fetchData();
  }, [eventId, eventFromRoute]);
=======
    if (!eventFromRoute) fetchEventDetails();
    loadCurrentUserId();
    fetchRSVPStatus();
    fetchComments();
    fetchLikes();
  }, [eventId]);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

  const sections = [
    {
      title: "Event Details",
<<<<<<< HEAD
      data: [event || {}],
      renderItem: ({ item }) => (
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
              <Text style={styles.headerTitle}>Event Details</Text>
            </TouchableOpacity>
          </View>
=======
      data: [event || {}], // Single item for event details
      renderItem: ({ item }) => (
        <View>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.event_date && new Date(item.event_date).toLocaleString()}</Text>
          <Text style={styles.content}>{item.content}</Text>
          {item.latitude && item.longitude && (
            <Text style={styles.location}>Location: Lat {item.latitude}, Lng {item.longitude}</Text>
          )}
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "red" : "#333"} />
            <Text style={styles.likeCount}>{likeCount}</Text>
          </TouchableOpacity>
          {item.user_id === currentUserId && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
              <Text style={styles.deleteText}>Delete Event</Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    },
    {
      title: "Attendees",
      data: attendees.length > 0 ? attendees : [{ id: "no-attendees", placeholder: true }],
      renderItem: ({ item }) =>
        item.placeholder ? (
<<<<<<< HEAD
          <Text style={styles.noAttendeesText}>No attendees yet.</Text>
        ) : (
          <View style={styles.attendeeItem}>
            <Text style={styles.attendeeText}>{item.username} - {item.status}</Text>
=======
          <Text>No attendees yet.</Text>
        ) : (
          <View style={styles.attendeeItem}>
            <Text>{item.username} - {item.status}</Text>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            {event?.user_id === currentUserId && item.status === "pending" && (
              <View style={styles.manageButtons}>
                <TouchableOpacity onPress={() => handleManageRSVP(item.user_id, "approve")}>
                  <Text style={styles.approve}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleManageRSVP(item.user_id, "deny")}>
                  <Text style={styles.deny}>Deny</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ),
    },
    {
      title: "RSVP",
<<<<<<< HEAD
      data: [{ id: "rsvp" }],
=======
      data: [{ id: "rsvp" }], // Dummy item for RSVP section
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      renderItem: () =>
        !rsvpStatus ? (
          <TouchableOpacity style={styles.rsvpButton} onPress={handleRSVP}>
            <Text style={styles.rsvpText}>RSVP</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.rsvpStatus}>Your RSVP Status: {rsvpStatus}</Text>
        ),
    },
    {
      title: "Comments",
      data: comments,
      renderItem: ({ item }) => (
        <View style={styles.commentItem}>
          <Text style={styles.commentUser}>{item.username}</Text>
          <Text style={styles.commentContent}>{item.content}</Text>
          <Text style={styles.commentDate}>{new Date(item.created_at).toLocaleString()}</Text>
          {(currentUserId === item.user_id || currentUserId === event?.user_id) && (
            <TouchableOpacity
              style={styles.deleteCommentButton}
              onPress={() => handleDeleteComment(item.id)}
            >
              <Text style={styles.deleteCommentText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    },
    {
      title: "Add Comment",
<<<<<<< HEAD
      data: [{ id: "comment-input" }],
=======
      data: [{ id: "comment-input" }], // Dummy item for comment input
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      renderItem: () => (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.commentSubmitButton, commentLoading && styles.disabledButton]}
            onPress={handleAddComment}
            disabled={commentLoading}
          >
            <Text style={styles.commentSubmitText}>{commentLoading ? "Posting..." : "Post"}</Text>
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#668CFF" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
<<<<<<< HEAD
        <Text style={styles.noEventText}>No event found.</Text>
=======
        <Text>No event found.</Text>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      </View>
    );
  }

  return (
    <SectionList
      style={styles.container}
      sections={sections}
<<<<<<< HEAD
      keyExtractor={(item, index) => (item.id ? item.id.toString() : `section-${index}`)}
=======
      keyExtractor={(item, index) => item.id ? item.id : `section-${index}`}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      stickySectionHeadersEnabled={false}
<<<<<<< HEAD
      contentContainerStyle={{ paddingBottom: 20 }}
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 18, marginLeft: 10, color: "#000", fontFamily: "AirbnbCereal_Md" },
  sectionHeader: { fontSize: 18, fontFamily: "AirbnbCereal_Md", color: "#333", marginTop: 20, marginBottom: 10 },
  title: { fontSize: 24, fontFamily: "AirbnbCereal_Md", color: "#333", marginVertical: 10 },
  date: { fontSize: 12, color: "#666", marginBottom: 10, fontFamily: "AirbnbCereal_Lt" },
  content: { fontSize: 16, color: "#333", marginBottom: 20, fontFamily: "AirbnbCereal_Lt" },
  location: { fontSize: 14, color: "#333", marginBottom: 20, fontFamily: "AirbnbCereal_Lt" },
  likeButton: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  likeCount: { marginLeft: 8, fontSize: 14, fontFamily: "AirbnbCereal_Md" },
  deleteButton: { backgroundColor: "#ff4444", padding: 10, borderRadius: 5, marginBottom: 20 },
  deleteText: { color: "#fff", textAlign: "center", fontFamily: "AirbnbCereal_Md" },
  attendeeItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  attendeeText: { fontSize: 14, color: "#333", fontFamily: "AirbnbCereal_Lt" },
  manageButtons: { flexDirection: "row" },
  approve: { color: "#0A58CA", marginRight: 10, fontFamily: "AirbnbCereal_Md" },
  deny: { color: "#ff4444", fontFamily: "AirbnbCereal_Md" },
  rsvpButton: { backgroundColor: "#0A58CA", padding: 10, borderRadius: 5, marginVertical: 20 },
  rsvpText: { color: "#fff", textAlign: "center", fontFamily: "AirbnbCereal_Md" },
  rsvpStatus: { fontSize: 14, color: "#333", marginVertical: 20, fontFamily: "AirbnbCereal_Lt" },
  commentItem: { marginBottom: 15 },
  commentUser: { fontSize: 14, fontFamily: "AirbnbCereal_Md", color: "#333" },
  commentContent: { fontSize: 14, color: "#333", fontFamily: "AirbnbCereal_Lt" },
  commentDate: { fontSize: 10, color: "#666", marginTop: 5, fontFamily: "AirbnbCereal_Lt" },
  deleteCommentButton: { marginTop: 5 },
  deleteCommentText: { color: "#ff4444", fontSize: 12, fontFamily: "AirbnbCereal_Md" },
  commentInputContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    height: 50,
    fontFamily: "AirbnbCereal_Md",
  },
  commentSubmitButton: { backgroundColor: "#0A58CA", padding: 10, borderRadius: 8, marginLeft: 10 },
  disabledButton: { backgroundColor: "#aaa" },
  commentSubmitText: { color: "#fff", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
  noAttendeesText: { fontSize: 14, color: "#666", fontFamily: "AirbnbCereal_Lt" },
  noEventText: { fontSize: 16, color: "#333", fontFamily: "AirbnbCereal_Md" },
=======
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  sectionHeader: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#333" },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 10 },
  date: { fontSize: 12, color: "#666", marginBottom: 10 },
  content: { fontSize: 16, color: "#333", marginBottom: 20 },
  location: { fontSize: 14, color: "#333", marginBottom: 20 },
  likeButton: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  likeCount: { marginLeft: 8, fontSize: 14 },
  deleteButton: { backgroundColor: "#ff4444", padding: 10, borderRadius: 5, marginBottom: 20 },
  deleteText: { color: "#fff", textAlign: "center" },
  attendeeItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  manageButtons: { flexDirection: "row" },
  approve: { color: "#0A58CA", marginRight: 10 },
  deny: { color: "#ff4444" },
  rsvpButton: { backgroundColor: "#0A58CA", padding: 10, borderRadius: 5, marginVertical: 20 },
  rsvpText: { color: "#fff", textAlign: "center" },
  rsvpStatus: { fontSize: 14, color: "#333", marginVertical: 20 },
  commentItem: { marginBottom: 15 },
  commentUser: { fontSize: 14, fontWeight: "bold", color: "#333" },
  commentContent: { fontSize: 14, color: "#333" },
  commentDate: { fontSize: 10, color: "#666", marginTop: 5 },
  deleteCommentButton: { marginTop: 5 },
  deleteCommentText: { color: "#ff4444", fontSize: 12 },
  commentInputContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, height: 50 },
  commentSubmitButton: { backgroundColor: "#0A58CA", padding: 10, borderRadius: 8, marginLeft: 10 },
  disabledButton: { backgroundColor: "#aaa" },
  commentSubmitText: { color: "#fff", fontSize: 16 },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
});

export default EventDetails;