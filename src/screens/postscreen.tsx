import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";

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

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");

  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);

  const handleTitleChange = useCallback((text: string) => {
    console.log("Title input changed:", text);
    setTitleInput(text);
  }, []);

  const handleContentChange = useCallback((text: string) => {
    console.log("Content input changed:", text);
    setContentInput(text);
  }, []);

  const loadCurrentUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      setCurrentUserId(storedUserId);
    } catch (error) {
      console.error("Error loading current user id:", error);
      Alert.alert("Error", "Could not load user information.");
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
      if (!token) {
        navigation.navigate("SignIn");
        setLoading(false);
        return;
      }
      const response = await apiClient.get(`/posts/${postId}`);
      setPost(response.data || {});
      setLikeCount(response.data.total_likes || 0);
      setLiked(response.data.user_liked || false);
      setTitleInput(response.data.title);
      setContentInput(response.data.content);
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
      if (!token) return;
      const response = await apiClient.get(`/posts/${postId}/comments`);
      setComments(response.data || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not fetch comments.");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Error", "Comment cannot be empty.");
      return;
    }
    setCommentLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      const response = await apiClient.post(`/posts/${postId}/comments`, { content: newComment });
      setComments([response.data.comment, ...comments]);
      setNewComment("");
      Alert.alert("Success", "Comment added successfully! The post creator has been notified.");
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
              navigation.navigate("SignIn");
              return;
            }
            await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
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
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      if (liked) {
        await apiClient.delete(`/posts/${postId}/like`);
        setLiked(false);
        setLikeCount((prev) => (prev > 0 ? prev - 1 : 0));
        Alert.alert("Success", "Like removed successfully!");
      } else {
        await apiClient.post(`/posts/${postId}/like`, {});
        setLiked(true);
        setLikeCount((prev) => prev + 1);
        Alert.alert("Success", "Post liked successfully! The post creator has been notified.");
      }
    } catch (error: any) {
      console.error("Error toggling like:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Could not toggle like.");
      // Revert the UI state if the API call fails
      setLiked(!liked);
      setLikeCount((prev) => (liked ? prev + 1 : Math.max(prev - 1, 0)));
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
            if (!token) {
              navigation.navigate("SignIn");
              return;
            }
            await apiClient.delete(`/posts/${postId}`);
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

  const updatePost = async (field: "title" | "content", value: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      await apiClient.put(`/posts/${postId}`, { [field]: value });
      setPost((prevPost: any) => (prevPost ? { ...prevPost, [field]: value } : prevPost));
    } catch (error: any) {
      console.error(`Error updating post ${field}:`, error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || `Could not update ${field}.`);
    }
  };

  const handleSaveEdits = async () => {
    try {
      if (editingTitle && titleInput !== post.title) {
        await updatePost("title", titleInput);
      }
      if (editingContent && contentInput !== post.content) {
        await updatePost("content", contentInput);
      }
      setEditingTitle(false);
      setEditingContent(false);
      Keyboard.dismiss();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelEdits = () => {
    setTitleInput(post.title);
    setContentInput(post.content);
    setEditingTitle(false);
    setEditingContent(false);
    Keyboard.dismiss();
  };

  const handleStartEditingTitle = () => {
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  const handleStartEditingContent = () => {
    setEditingContent(true);
    setTimeout(() => contentInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchPostDetails(), loadCurrentUserId(), fetchComments()]);
    };
    fetchData();
  }, [postId]);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      console.log("Keyboard dismissed unexpectedly");
    });
    return () => keyboardDidHideListener.remove();
  }, []);

  const memoizedHeader = useMemo(() => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={{ flex: 1 }}
      >
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
              <Text style={styles.headerTitle}>Post</Text>
            </TouchableOpacity>
          </View>
          {post?.user_id === currentUserId ? (
            editingTitle ? (
              <TextInput
                ref={titleInputRef}
                style={styles.titleInput}
                value={titleInput}
                onChangeText={handleTitleChange}
                autoFocus={true}
                blurOnSubmit={false}
                returnKeyType="next"
                onSubmitEditing={() => contentInputRef.current?.focus()}
              />
            ) : (
              <TouchableOpacity onPress={handleStartEditingTitle}>
                <Text style={styles.title}>{post?.title}</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text style={styles.title}>{post?.title}</Text>
          )}
          {post?.user_id === currentUserId ? (
            editingContent ? (
              <TextInput
                ref={contentInputRef}
                style={styles.contentInput}
                value={contentInput}
                onChangeText={handleContentChange}
                multiline
                autoFocus={true}
                blurOnSubmit={false}
                returnKeyType="default"
              />
            ) : (
              <TouchableOpacity onPress={handleStartEditingContent}>
                <Text style={styles.content}>{post?.content}</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text style={styles.content}>{post?.content}</Text>
          )}
          {(editingTitle || editingContent) && (
            <View style={styles.editControls}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdits}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdits}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.date}>{post && new Date(post.created_at).toLocaleString()}</Text>
          {post?.is_event && (
            <>
              {post.image && (
                <Image source={{ uri: post.image }} style={styles.bannerPreview} />
              )}
              <Text style={styles.eventDetailText}>
                Date: {new Date(post.event_date).toLocaleDateString()}
              </Text>
              <Text style={styles.eventDetailText}>
                Location: {post.event_state}, {post.event_city}
              </Text>
            </>
          )}
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
      </KeyboardAvoidingView>
    );
  }, [
    post,
    currentUserId,
    editingTitle,
    editingContent,
    titleInput,
    contentInput,
    liked,
    likeCount,
    navigation,
  ]);

  const renderFooter = () => (
    <View style={styles.commentInputContainer}>
      <TextInput
        style={styles.commentInput}
        placeholder="Add a comment..."
        value={newComment}
        onChangeText={setNewComment}
        multiline
        blurOnSubmit={false}
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
        <Text style={styles.noPostText}>No post found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      keyboardShouldPersistTaps="always"
      style={styles.container}
      data={comments}
      keyExtractor={(item) => item.id.toString()}
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
      ListHeaderComponent={memoizedHeader}
      ListFooterComponent={renderFooter}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 40 },
  headerContainer: { marginBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 18, marginLeft: 10, color: "#000", fontFamily: "AirbnbCereal_Md" },
  title: { fontSize: 24, fontFamily: "AirbnbCereal_Md", color: "#333", marginVertical: 10 },
  content: { fontSize: 16, color: "#333", marginBottom: 20, fontFamily: "AirbnbCereal_Lt" },
  titleInput: {
    fontSize: 24,
    fontFamily: "AirbnbCereal_Md",
    color: "#333",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  contentInput: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Lt",
    color: "#333",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    textAlignVertical: "top",
    minHeight: 100,
  },
  editControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: "#0A58CA",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: "AirbnbCereal_Md",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "#fff",
    fontFamily: "AirbnbCereal_Md",
    fontSize: 16,
  },
  date: { fontSize: 12, color: "#666", marginBottom: 10, fontFamily: "AirbnbCereal_Lt" },
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
    color: "#333",
  },
  commentSubmitButton: { backgroundColor: "#0A58CA", padding: 10, borderRadius: 8, marginLeft: 10 },
  disabledButton: { backgroundColor: "#aaa" },
  commentSubmitText: { color: "#fff", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
  noPostText: { fontSize: 16, color: "#333", fontFamily: "AirbnbCereal_Md" },
  bannerPreview: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  eventDetailText: { fontSize: 14, color: "#333", fontFamily: "AirbnbCereal_Md", marginBottom: 5 },
});

export default PostScreen;