import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const PostScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { postId } = route.params || {};
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const fetchPostDetails = async () => {
    if (!postId) {
      Alert.alert("Error", "Post ID is missing.");
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
      const response = await axios.get(`http://192.168.1.231:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(response.data || {});
      setLikeCount(response.data.like_count || 0);
      setLiked(response.data.user_liked || false);
=======
      const response = await axios.get(`http://10.0.2.2:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(response.data);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    } catch (error: any) {
      console.error("Error fetching post details:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not fetch post details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!postId) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      if (!token) return;
      const response = await axios.get(`http://192.168.1.231:5000/api/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data || []);
=======
      const response = await axios.get(`http://10.0.2.2:5000/api/posts/${postId}/comments`, {
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
    if (!postId) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`http://10.0.2.2:5000/api/posts/${postId}/likes`, {
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
        `http://192.168.1.231:5000/api/posts/${postId}/comments`,
=======
        Alert.alert("Error", "Please log in to comment.");
        return;
      }
      const response = await axios.post(
        `http://10.0.2.2:5000/api/posts/${postId}/comments`,
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
            await axios.delete(`http://192.168.1.231:5000/api/posts/${postId}/comments/${commentId}`, {
=======
              Alert.alert("Error", "Please log in to delete comments.");
              return;
            }
            await axios.delete(`http://10.0.2.2:5000/api/posts/${postId}/comments/${commentId}`, {
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
        await axios.delete(`http://192.168.1.231:5000/api/posts/${postId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLiked(false);
        setLikeCount(likeCount - 1);
        Alert.alert("Success", "Post unliked!");
      } else {
        await axios.post(
          `http://192.168.1.231:5000/api/posts/${postId}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLiked(true);
        setLikeCount(likeCount + 1);
        Alert.alert("Success", "Post liked!");
      }
    } catch (error: any) {
      console.error("Error toggling like:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Could not toggle like.");
=======
      await axios.post(
        `http://10.0.2.2:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(true);
      setLikeCount(likeCount + 1);
      Alert.alert("Success", "Post liked!");
    } catch (error: any) {
      console.error("Error liking post:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Could not like post.");
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  };

  const handleDeletePost = async () => {
    if (!postId) {
      Alert.alert("Error", "Post ID is missing.");
      return;
    }
    Alert.alert("Confirm Delete", "Are you sure you want to delete this post?", [
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
            await axios.delete(`http://192.168.1.231:5000/api/posts/${postId}`, {
=======
            await axios.delete(`http://10.0.2.2:5000/api/posts/${postId}`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Success", "Post deleted successfully!");
            navigation.goBack();
          } catch (error: any) {
            console.error("Error deleting post:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "Could not delete post.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
<<<<<<< HEAD
    const fetchData = async () => {
      await Promise.all([fetchPostDetails(), loadCurrentUserId(), fetchComments()]);
    };
    fetchData();
  }, [postId]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.headerTitle}>Post</Text>
        </TouchableOpacity>
      </View>
=======
    fetchPostDetails();
    loadCurrentUserId();
    fetchComments();
    fetchLikes();
  }, [postId]);

  const renderHeader = () => (
    <View>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      <Text style={styles.title}>{post?.title}</Text>
      <Text style={styles.date}>{post && new Date(post.created_at).toLocaleString()}</Text>
      <Text style={styles.content}>{post?.content}</Text>
      <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
        <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "red" : "#333"} />
        <Text style={styles.likeCount}>{likeCount}</Text>
      </TouchableOpacity>
      {post?.user_id === currentUserId && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
          <Text style={styles.deleteText}>Delete Post</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.commentsTitle}>Comments:</Text>
    </View>
  );

  const renderFooter = () => (
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
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#668CFF" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
<<<<<<< HEAD
        <Text style={styles.noPostText}>No post found.</Text>
=======
        <Text>No post found.</Text>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={comments}
<<<<<<< HEAD
      keyExtractor={(item) => item.id.toString()}
=======
      keyExtractor={(item) => item.id}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      renderItem={({ item }) => (
        <View style={styles.commentItem}>
          <Text style={styles.commentUser}>{item.username}</Text>
          <Text style={styles.commentContent}>{item.content}</Text>
          <Text style={styles.commentDate}>{new Date(item.created_at).toLocaleString()}</Text>
          {(currentUserId === item.user_id || currentUserId === post.user_id) && (
            <TouchableOpacity
              style={styles.deleteCommentButton}
              onPress={() => handleDeleteComment(item.id)}
            >
              <Text style={styles.deleteCommentText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
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
  headerContainer: { marginBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 18, marginLeft: 10, color: "#000", fontFamily: "AirbnbCereal_Md" },
  title: { fontSize: 24, fontFamily: "AirbnbCereal_Md", color: "#333", marginVertical: 10 },
  date: { fontSize: 12, color: "#666", marginBottom: 10, fontFamily: "AirbnbCereal_Lt" },
  content: { fontSize: 16, color: "#333", marginBottom: 20, fontFamily: "AirbnbCereal_Lt" },
  likeButton: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  likeCount: { marginLeft: 8, fontSize: 14, fontFamily: "AirbnbCereal_Md" },
  deleteButton: { backgroundColor: "#ff4444", padding: 10, borderRadius: 5, marginBottom: 20 },
  deleteText: { color: "#fff", textAlign: "center", fontFamily: "AirbnbCereal_Md" },
  commentsTitle: { fontSize: 18, fontFamily: "AirbnbCereal_Md", color: "#333", marginBottom: 10 },
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
  noPostText: { fontSize: 16, color: "#333", fontFamily: "AirbnbCereal_Md" },
=======
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 10 },
  date: { fontSize: 12, color: "#666", marginBottom: 10 },
  content: { fontSize: 16, color: "#333", marginBottom: 20 },
  likeButton: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  likeCount: { marginLeft: 8, fontSize: 14 },
  deleteButton: { backgroundColor: "#ff4444", padding: 10, borderRadius: 5, marginBottom: 20 },
  deleteText: { color: "#fff", textAlign: "center" },
  commentsTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
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

export default PostScreen;