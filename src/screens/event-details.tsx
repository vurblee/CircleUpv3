import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  SectionList,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import apiClient from "../api/apiClient";
import Header from "../components/header";

const windowWidth = Dimensions.get("window").width;

const toggleLike = async (postId, liked, setLiked, setLikeCount) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;

    if (liked) {
      await apiClient.delete(`/posts/${postId}/like`);
      setLiked(false);
      setLikeCount((prev) => Math.max(prev - 1, 0));
      // Removed the success alert
    } else {
      await apiClient.post(`/posts/${postId}/like`, {});
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      // Removed the success alert
    }
  } catch (error) {
    console.error("Error toggling like:", error.response?.data || error.message);
    Alert.alert("Error", error.response?.data?.message || "Could not toggle like.");
  }
};

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
  const [photos, setPhotos] = useState<any[]>([]);
  const [bannerPhoto, setBannerPhoto] = useState<string | null>(eventFromRoute?.banner_photo || null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [editingTitleEvent, setEditingTitleEvent] = useState(false);
  const [editingContentEvent, setEditingContentEvent] = useState(false);
  const [editingLocationEvent, setEditingLocationEvent] = useState(false);
  const [titleEventInput, setTitleEventInput] = useState("");
  const [contentEventInput, setContentEventInput] = useState("");
  const [locationEventInput, setLocationEventInput] = useState("");
  const [selectedPredefinedLocation, setSelectedPredefinedLocation] = useState<string>("");

  const loadCurrentUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      setCurrentUserId(storedUserId);
    } catch (error) {
      console.error("Error loading current user id:", error);
      Alert.alert("Error", "Could not load user information.");
    }
  };

  const fetchEventDetails = async () => {
    try {
      const response = await apiClient.get(`/posts/${eventId}`);
      setEvent(response.data);
      setBannerPhoto(response.data.banner_photo || null);
      setAttendees(response.data.attendees || []);
      setLikeCount(response.data.total_likes || 0);
      setLiked(response.data.user_liked || false);
      setLocationEventInput(response.data.location || "");
      const photosResponse = await apiClient.get(`/posts/${eventId}/photos`);
      setPhotos(photosResponse.data || []);
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
      const response = await apiClient.get(`/posts/${eventId}/rsvp`);
      setRsvpStatus(response.data.status || null);
    } catch (error: any) {
      console.error("Error fetching RSVP status:", error.response?.data || error.message);
    }
  };

  const fetchComments = async () => {
    if (!eventId) return;
    try {
      const response = await apiClient.get(`/posts/${eventId}/comments`);
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
      const response = await apiClient.post(`/posts/${eventId}/comments`, { content: newComment });
      setComments([response.data.comment, ...comments]);
      setNewComment("");
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
            await apiClient.delete(`/posts/${eventId}/comments/${commentId}`);
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
    await toggleLike(eventId, liked, setLiked, setLikeCount);
  };

  const handleRSVP = async () => {
    if (!eventId) {
      Alert.alert("Error", "Event ID is missing.");
      return;
    }
    try {
      const response = await apiClient.post(`/posts/${eventId}/rsvp`, {});
      setRsvpStatus(response.data.status || "pending");
      await fetchEventDetails();
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
      await apiClient.post(`/posts/${eventId}/rsvp/manage`, { userIdToManage: userId, action });
      Alert.alert("Success", `RSVP ${action}d`);
      await fetchEventDetails();
    } catch (error: any) {
      console.error("Error managing RSVP:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || `Could not ${action} RSVP.`);
    }
  };

  const handleRemoveAttendee = async (userIdToRemove: string) => {
    if (!eventId) {
      Alert.alert("Error", "Event ID is missing.");
      return;
    }
    Alert.alert("Confirm Removal", "Are you sure you want to remove this attendee?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/posts/${eventId}/rsvp/${userIdToRemove}`);
            Alert.alert("Success", "Attendee removed successfully!");
            await fetchEventDetails();
          } catch (error: any) {
            console.error("Error removing attendee:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "Could not remove attendee.");
          }
        },
      },
    ]);
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
            await apiClient.delete(`/posts/${eventId}`);
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

  const uploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow access to your media library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets) {
        const uri = result.assets[0].uri;
        let caption = "";
        await new Promise((resolve) => {
          Alert.alert("Add Caption", "Enter a caption for your photo (optional)", [
            { text: "Skip", onPress: () => resolve(null) },
            {
              text: "OK",
              onPress: () => {
                Alert.prompt("Caption", "Enter your caption", (text) => {
                  caption = text;
                  resolve(null);
                });
              },
            },
          ]);
        });

        const formData = new FormData();
        formData.append("photo", {
          uri,
          name: `photo-${eventId}-${Date.now()}.${uri.split(".").pop()}`,
          type: `image/${uri.split(".").pop()}`,
        } as any);
        formData.append("caption", caption);

        setLoading(true);
        await apiClient.post(`/posts/${eventId}/photos`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        await fetchEventDetails();
        Alert.alert("Success", "Photo uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Error uploading event photo:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Failed to upload photo.");
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = (photoId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await apiClient.delete(`/posts/${eventId}/photos/${photoId}`);
            await fetchEventDetails();
            Alert.alert("Success", "Photo deleted successfully!");
          } catch (error: any) {
            console.error("Error deleting photo:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "Failed to delete photo.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const setAsBannerPhoto = async (photoUrl: string) => {
    try {
      await apiClient.put(`/posts/${eventId}/banner`, { banner_photo: photoUrl });
      await fetchEventDetails();
      Alert.alert("Success", "Banner photo updated successfully!");
    } catch (error: any) {
      console.error("Error setting banner photo:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Failed to set banner photo.");
    }
  };

  const updateEvent = async (fields: { [key: string]: any }) => {
    try {
      await apiClient.put(`/posts/${eventId}/event`, fields);
      setEvent((prevEvent: any) =>
        prevEvent ? { ...prevEvent, ...fields } : prevEvent
      );
    } catch (error: any) {
      console.error("Error updating event:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not update event.");
    }
  };

  const handleSaveEditsEvent = async () => {
    const updates: { [key: string]: any } = {};
    if (editingTitleEvent && titleEventInput !== event.title) {
      updates.title = titleEventInput;
    }
    if (editingContentEvent && contentEventInput !== event.content) {
      updates.content = contentEventInput;
    }
    if (editingLocationEvent && locationEventInput !== event.location) {
      const geocoded = await Location.geocodeAsync(locationEventInput);
      if (geocoded.length > 0) {
        updates.location = locationEventInput;
        updates.latitude = geocoded[0].latitude;
        updates.longitude = geocoded[0].longitude;
      } else {
        Alert.alert("Error", "Could not geocode the location.");
        return;
      }
    }
    if (Object.keys(updates).length > 0) {
      await updateEvent(updates);
    }
    setEditingTitleEvent(false);
    setEditingContentEvent(false);
    setEditingLocationEvent(false);
  };

  const handleCancelEditsEvent = () => {
    setTitleEventInput(event.title);
    setContentEventInput(event.content);
    setLocationEventInput(event.location || "");
    setEditingTitleEvent(false);
    setEditingContentEvent(false);
    setEditingLocationEvent(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadCurrentUserId();
      await fetchEventDetails();
      await fetchRSVPStatus();
      await fetchComments();
      setLoading(false);
    };
    loadData();
  }, [eventId]);

  useEffect(() => {
    if (event) {
      setTitleEventInput(event.title);
      setContentEventInput(event.content);
      setLocationEventInput(event.location || "");
    }
  }, [event]);

  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        await fetchEventDetails();
        await fetchRSVPStatus();
        await fetchComments();
      };
      refreshData();
    }, [eventId])
  );

  const sections = [
    {
      title: "",
      data: [event || {}],
      renderItem: ({ item }) => (
        <View style={styles.content}>
          {bannerPhoto ? (
            <Image source={{ uri: bannerPhoto }} style={styles.bannerPhoto} />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Text style={styles.bannerPlaceholderText}>No Banner Photo</Text>
            </View>
          )}
          {currentUserId === event?.user_id && editingTitleEvent ? (
            <TextInput
              value={titleEventInput}
              onChangeText={setTitleEventInput}
              style={styles.titleInput}
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (currentUserId === event?.user_id) setEditingTitleEvent(true);
              }}
            >
              <Text style={styles.title}>{item.title}</Text>
            </TouchableOpacity>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={styles.date}>
              {item.event_date && new Date(item.event_date).toLocaleString()}
            </Text>
            {currentUserId === event?.user_id && (editingTitleEvent || editingContentEvent || editingLocationEvent) && (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEditsEvent}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEditsEvent}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {currentUserId === event?.user_id && editingContentEvent ? (
            <TextInput
              value={contentEventInput}
              onChangeText={setContentEventInput}
              style={styles.contentInput}
              multiline
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (currentUserId === event?.user_id) setEditingContentEvent(true);
              }}
            >
              <Text style={styles.contentText}>{item.content}</Text>
            </TouchableOpacity>
          )}
          {currentUserId === event?.user_id && editingLocationEvent ? (
            <TextInput
              value={locationEventInput}
              onChangeText={setLocationEventInput}
              style={styles.locationInput}
              placeholder="Enter event location (e.g., Central Park, New York)"
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (currentUserId === event?.user_id) setEditingLocationEvent(true);
              }}
            >
              <Text style={styles.location}>
                Location: {item.location || "Not set"}
              </Text>
            </TouchableOpacity>
          )}
          {item.latitude && item.longitude && (
            <>
              <Text style={styles.coordinates}>
                Coordinates: Lat {item.latitude}, Lng {item.longitude}
              </Text>
              <MapView
                style={styles.map}
                region={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                  title={item.title}
                  description={item.location}
                />
              </MapView>
            </>
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
          <Text style={styles.noAttendeesText}>No attendees yet.</Text>
        ) : (
          <View style={styles.attendeeItem}>
            <Text style={styles.attendeeText}>
              {item.username || "Unknown"} - {item.status || "Unknown"}
            </Text>
            {event?.user_id === currentUserId && (
              <View style={styles.manageButtons}>
                {item.status === "pending" ? (
                  <>
                    <TouchableOpacity onPress={() => handleManageRSVP(item.user_id, "approve")}>
                      <Text style={styles.approve}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleManageRSVP(item.user_id, "deny")}>
                      <Text style={styles.deny}>Deny</Text>
                    </TouchableOpacity>
                  </>
                ) : item.status === "approved" ? (
                  <TouchableOpacity onPress={() => handleRemoveAttendee(item.user_id)}>
                    <Text style={styles.deny}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </View>
        ),
    },
    {
      title: "RSVP",
      data: [{ id: "rsvp" }],
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
      title: "Event Photos",
      data: [{}],
      renderItem: () => (
        <View>
          {event?.user_id === currentUserId && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={uploadPhoto}>
              <Ionicons name="add" size={24} color="#0A58CA" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
          {photos && photos.length > 0 ? (
            <ScrollView horizontal style={styles.photosContainer}>
              {photos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  onPress={() => {
                    setSelectedPhotoUrl(photo.photo_url);
                    setModalVisible(true);
                  }}
                >
                  <View style={styles.photoItem}>
                    <Image
                      source={{ uri: photo.photo_url }}
                      style={styles.photo}
                      onError={(error) => console.error("Image Load Error:", error.nativeEvent)}
                    />
                    <TouchableOpacity
                      style={styles.setBannerButton}
                      onPress={() => setAsBannerPhoto(photo.photo_url)}
                    >
                      <Text style={styles.setBannerButtonText}>Set as Banner</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deletePhotoButton}
                      onPress={() => deletePhoto(photo.id)}
                    >
                      <Text style={styles.deletePhotoText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noPhotosText}>No photos available</Text>
          )}
        </View>
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
      data: [{ id: "comment-input" }],
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
        <Text style={styles.noEventText}>No event found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={event.title || "Event Details"}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        titleStyle={{
          flex: 1,
          textAlign: "left",
          marginLeft: 10,
          fontSize: 20,
          marginTop: Platform.OS === "android" ? (StatusBar.currentHeight || 40) + 5 : 5,
        }}
        leftButtonStyle={{
          marginLeft: 10,
          marginTop: Platform.OS === "android" ? (StatusBar.currentHeight || 40) + 5 : 5,
        }}
      />
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : `section-${index}`)}
        renderSectionHeader={({ section: { title } }) =>
          title ? <Text style={styles.sectionHeader}>{title}</Text> : null
        }
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedPhotoUrl && (
            <Image source={{ uri: selectedPhotoUrl }} style={styles.modalImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: "AirbnbCereal_Md",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "AirbnbCereal_Md",
    color: "#333",
    marginVertical: 10,
    marginRight: 60,
  },
  titleInput: {
    fontSize: 24,
    fontFamily: "AirbnbCereal_Md",
    color: "#333",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontFamily: "AirbnbCereal_Lt",
  },
  contentText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    fontFamily: "AirbnbCereal_Md",
  },
  contentInput: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    fontFamily: "AirbnbCereal_Book",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },
  location: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    fontFamily: "AirbnbCereal_Md",
  },
  locationInput: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
    fontFamily: "AirbnbCereal_Book",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },
  map: {
    width: windowWidth - 40,
    height: 200,
    marginBottom: 20,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  likeCount: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "AirbnbCereal_Md",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  deleteText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "AirbnbCereal_Md",
  },
  saveButton: {
    backgroundColor: "#0A58CA",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "AirbnbCereal_Md",
  },
  cancelButton: {
    backgroundColor: "#aaa",
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "AirbnbCereal_Md",
  },
  attendeeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  attendeeText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "AirbnbCereal_Md",
  },
  manageButtons: {
    flexDirection: "row",
  },
  approve: {
    color: "#0A58CA",
    marginRight: 10,
    fontFamily: "AirbnbCereal_Md",
  },
  deny: {
    color: "#ff4444",
    fontFamily: "AirbnbCereal_Md",
  },
  rsvpButton: {
    backgroundColor: "#0A58CA",
    padding: 10,
    borderRadius: 5,
    marginVertical: 15,
    marginHorizontal: 20,
  },
  rsvpText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "AirbnbCereal_Md",
  },
  rsvpStatus: {
    fontSize: 14,
    color: "#333",
    marginVertical: 20,
    fontFamily: "AirbnbCereal_Md",
    paddingHorizontal: 20,
  },
  commentItem: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  commentUser: {
    fontSize: 14,
    fontFamily: "AirbnbCereal_Md",
    color: "#333",
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
    fontFamily: "AirbnbCereal_Book",
  },
  commentDate: {
    fontSize: 10,
    color: "#666",
    marginTop: 5,
    fontFamily: "AirbnbCereal_Lt",
  },
  deleteCommentButton: {
    marginTop: 5,
  },
  deleteCommentText: {
    color: "#ff4444",
    fontSize: 12,
    fontFamily: "AirbnbCereal_Md",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    height: 50,
    fontFamily: "AirbnbCereal_Md",
  },
  commentSubmitButton: {
    backgroundColor: "#0A58CA",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  commentSubmitText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
  noAttendeesText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "AirbnbCereal_Book",
    paddingHorizontal: 20,
  },
  noEventText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "AirbnbCereal_Md",
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#0A58CA",
    borderRadius: 15,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  addPhotoText: {
    color: "#0A58CA",
    fontFamily: "AirbnbCereal_Md",
    marginLeft: 5,
  },
  photosContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  photoItem: {
    marginRight: 10,
    position: "relative",
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  deletePhotoButton: {
    marginTop: 5,
    backgroundColor: "#ff4444",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deletePhotoText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "AirbnbCereal_Md",
    textAlign: "center",
  },
  setBannerButton: {
    marginTop: 5,
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#0A58CA",
  },
  setBannerButtonText: {
    color: "#0A58CA",
    fontSize: 12,
    fontFamily: "AirbnbCereal_Md",
    textAlign: "center",
  },
  noPhotosText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "AirbnbCereal_Book",
    paddingHorizontal: 20,
  },
  bannerPhoto: {
    width: windowWidth,
    height: 200,
    resizeMode: "cover",
    alignSelf: "center",
  },
  bannerPlaceholder: {
    width: windowWidth,
    height: 200,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  bannerPlaceholderText: {
    color: "#666",
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  modalImage: {
    width: windowWidth - 40,
    height: 300,
  },
  coordinates: {
    fontSize: 14,
    color: "#333",
    fontFamily: "AirbnbCereal_Md",
  },
});

export default EventDetails;