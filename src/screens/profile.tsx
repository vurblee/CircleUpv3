import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  Animated,
  Alert,
  Dimensions,
  SectionList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { decode as atob } from "base-64";
import apiClient from "../api/apiClient";

const { height: windowHeight } = Dimensions.get("window");

const INTEREST_OPTIONS = [
  "Fishing", "Cooking", "Travel", "Photography", "Reading", "Cycling", "Running",
  "Yoga", "Dancing", "Swimming", "Coding", "Music", "Movies", "Theater", "Art",
  "Fashion", "Gaming", "Technology", "Fitness", "Blogging", "DIY", "Volunteering",
  "Camping", "Skiing", "Snowboarding", "Surfing", "Bowling", "Golf", "Tennis",
  "Badminton", "Rugby", "Cricket", "Baseball", "Soccer", "Basketball", "Boxing",
  "Martial Arts", "Wine Tasting", "Chess", "Hiking", "Lime", "Magenta", "Coral",
  "Mint", "Lavender", "Peach", "Cerulean", "Periwinkle", "Rose", "Salmon",
];

const RAINBOW_COLORS = [
  "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF",
  "#FF1493", "#00CED1",
];

function decodeJwt(token: string) {
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
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    throw new Error("Invalid token");
  }
}

const getProfilePicUrl = (pic: string) => {
  if (!pic) return "https://via.placeholder.com/100";
  return pic;
};

interface Photo {
  id: number; // Changed from string to number to match integer photo_id
  photo_url: string;
  caption: string;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId: paramUserId } = route.params || {};
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const slideAnim = useRef(new Animated.Value(windowHeight)).current;

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<string>("");
  const [photos, setPhotos] = useState<Photo[]>([]); // Updated type to reflect integer id
  const [eventsVisited, setEventsVisited] = useState<any[]>([]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "No authentication token found. Please sign in.");
        navigation.navigate("SignIn");
        return;
      }
      const decodedToken = decodeJwt(token);
      const currentUserId = decodedToken.userId;
      const idToFetch = paramUserId || currentUserId;

      const response = await apiClient.get(`/users/${idToFetch}?timestamp=${Date.now()}`);
      console.log("Fetched profile photos:", response.data.photos); // Debug log
      setProfile(response.data);
      setEditName(response.data.name || "");
      setEditEmail(response.data.email || "");
      setEditUsername(response.data.username || "");
      setEditBio(response.data.bio || "");
      setSelectedInterests(response.data.interests || []);
      setProfilePic(response.data.profile_picture || "");
      setPhotos(
        response.data.photos.map((photo: any) => ({
          id: Number(photo.id), // Ensure id is a number
          photo_url: photo.photo_url,
          caption: photo.caption || "",
        }))
      );
      setIsOwnProfile(idToFetch === currentUserId);
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigation, paramUserId]);

  const fetchEventsVisited = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "No authentication token found. Please sign in.");
        navigation.navigate("SignIn");
        return;
      }
      const decodedToken = decodeJwt(token);
      const currentUserId = decodedToken.userId;
      const idToFetch = paramUserId || currentUserId;

      const response = await apiClient.get("/posts/past-events");
      const pastEvents = response.data || [];
      if (pastEvents.length > 0 && pastEvents[0].attendees) {
        const attendedEvents = pastEvents.filter((event: any) =>
          event.attendees.includes(idToFetch)
        );
        setEventsVisited(attendedEvents);
      } else {
        console.warn("No attendees field found; displaying all past events as visited.");
        setEventsVisited(pastEvents);
      }
    } catch (error) {
      console.error("Error fetching events visited:", error);
    }
  }, [navigation, paramUserId]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchEventsVisited();
    }, [fetchProfile, fetchEventsVisited])
  );

  const openEditPanel = () => {
    setEditMode(true);
    Animated.timing(slideAnim, {
      toValue: windowHeight * 0.25,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeEditPanel = () => {
    Animated.timing(slideAnim, {
      toValue: windowHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setEditMode(false));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length >= 9
        ? (Alert.alert("Limit Reached", "You can only select up to 9 interests."), prev)
        : [...prev, interest]
    );
  };

  const uploadProfilePic = async (uri: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");
      if (!token || !userId) {
        throw new Error("Missing token or userId");
      }

      const formData = new FormData();
      formData.append("profile_picture", {
        uri,
        name: `profile-${userId}.${uri.split(".").pop()}`,
        type: `image/${uri.split(".").pop()}`,
      } as any);

      console.log("Uploading profile picture with URI:", uri);
      const response = await apiClient.post(`/users/${userId}/profile-picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Server response:", response.data);

      const newProfilePic =
        typeof response.data.profile_picture === "string"
          ? response.data.profile_picture
          : getProfilePicUrl(profile.profile_picture);
      setProfile((prevProfile: any) => ({ ...prevProfile, profile_picture: newProfilePic }));
      setProfilePic(newProfilePic);
      console.log("New profile pic set to:", newProfilePic);
      await AsyncStorage.setItem("userProfilePic", newProfilePic);
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to upload profile picture.");
    } finally {
      setLoading(false);
    }
  };

  const pickProfilePic = async () => {
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
        const asset = result.assets[0];
        console.log("Image size (bytes):", asset.fileSize);
        if (asset.fileSize && asset.fileSize > 1024 * 1024) {
          // 1MB limit
          Alert.alert("Error", "Image size exceeds 1MB limit.");
          return;
        }
        await uploadProfilePic(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image.");
    }
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
        const token = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId");
        let caption = "";
        await new Promise((resolve) => {
          Alert.alert(
            "Add Caption",
            "Enter a caption for your photo (optional)",
            [
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
            ]
          );
        });
        const formData = new FormData();
        formData.append("photo", {
          uri,
          name: `photo-${userId}-${Date.now()}.${uri.split(".").pop()}`,
          type: `image/${uri.split(".").pop()}`,
        } as any);
        formData.append("caption", caption);
        setLoading(true);
        const response = await apiClient.post(`/users/${userId}/photos`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Photo upload response:", response.data); // Debug log
        setPhotos((prev) => [
          ...prev,
          {
            id: Number(response.data.photo_id), // Ensure id is a number
            photo_url: response.data.photo_url,
            caption: response.data.caption || "",
          },
        ]);
        Alert.alert("Success", "Photo uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading photo:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to upload photo.");
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = (photoId: number) => { // Changed parameter type to number
    Alert.alert("Confirm Delete", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            const userId = await AsyncStorage.getItem("userId");

            if (!token || !userId) {
              throw new Error("Missing token or user ID");
            }

            setLoading(true);
            console.log(`Attempting to delete photo with ID: ${photoId}`); // Debug log
            const response = await apiClient.delete(`/users/${userId}/photos/${photoId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Delete response:", response.data); // Debug log

            setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
            Alert.alert("Success", "Photo deleted successfully!");
          } catch (error) {
            console.error("Error deleting photo:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "Failed to delete photo.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");
      if (!token || !userId) throw new Error("Missing token or userId");
      let profilePicUrl = profilePic;
      if (profilePic && profilePic.startsWith("file://")) {
        const formData = new FormData();
        formData.append("profile_picture", {
          uri: profilePic,
          name: `profile-${userId}.${profilePic.split(".").pop()}`,
          type: `image/${profilePic.split(".").pop()}`,
        } as any);
        const uploadResponse = await apiClient.post(`/users/${userId}/profile-picture`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        profilePicUrl = uploadResponse.data.profile_picture;
      }
      const formData = new FormData();
      formData.append("name", editName.trim() ? editName : profile.name);
      formData.append("email", editEmail.trim() ? editEmail : profile.email);
      formData.append("username", editUsername.trim() ? editUsername : profile.username);
      formData.append("bio", editBio || profile.bio || "");
      formData.append(
        "interests",
        JSON.stringify(selectedInterests.length ? selectedInterests : profile.interests || [])
      );
      await apiClient.put(`/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success", "Profile updated successfully!");
      await fetchProfile();
      closeEditPanel();
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderItem = ({ item, section }: { item: any; section: any }) => {
    if (section.title === "Profile Info") {
      return (
        <View style={styles.profileInfo}>
          {isOwnProfile && (
            <TouchableOpacity onPress={pickProfilePic}>
              <Image source={{ uri: getProfilePicUrl(profile.profile_picture) }} style={styles.profilePic} />
            </TouchableOpacity>
          )}
          {!isOwnProfile && (
            <Image source={{ uri: getProfilePicUrl(profile.profile_picture) }} style={styles.profilePic} />
          )}
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.onlineStatus}>
              {profile.is_online ? "Online" : "Offline"}
            </Text>
          </View>
          {isOwnProfile && (
            <TouchableOpacity style={styles.editProfileButton} onPress={openEditPanel}>
              <Ionicons name="create-outline" size={18} color="#668CFF" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    if (section.title === "About Me") {
      return (
        <Text style={styles.bioText}>
          {profile.bio && profile.bio.trim() ? profile.bio : "No bio provided."}
        </Text>
      );
    }
    if (section.title === "Interests") {
      return (
        <View style={styles.interestsContainer}>
          {profile.interests?.length > 0 ? (
            profile.interests.map((interest: string, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.interestBubble,
                  { backgroundColor: RAINBOW_COLORS[idx % RAINBOW_COLORS.length] },
                ]}
              >
                <Text style={[styles.interestText, { color: "#fff" }]}>{interest}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noInterestsText}>No interests added.</Text>
          )}
        </View>
      );
    }
    if (section.title === "Photos") {
      return (
        <View>
          <View style={styles.photosHeader}>
            {isOwnProfile && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={uploadPhoto}>
                <Ionicons name="add" size={24} color="#668CFF" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
          {photos.length > 0 ? (
            <ScrollView horizontal style={styles.photosContainer}>
              {photos
                .filter((photo) => photo.photo_url && typeof photo.photo_url === "string")
                .map((photo) => (
                  <View key={photo.id} style={styles.photoItem}>
                    <Image source={{ uri: photo.photo_url }} style={styles.photo} />
                    <Text style={styles.photoCaption}>{photo.caption || "No caption"}</Text>
                    {isOwnProfile && (
                      <TouchableOpacity
                        style={styles.deletePhotoButton}
                        onPress={() => deletePhoto(photo.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
            </ScrollView>
          ) : (
            <Text style={styles.noPhotosText}>No photos available.</Text>
          )}
        </View>
      );
    }
    if (section.title === "Events Visited") {
      if (item.id === "none") {
        return <Text style={styles.noEventsText}>No events visited yet.</Text>;
      }
      const eventDate = new Date(item.event_date);
      const formattedDate = eventDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return (
        <TouchableOpacity
          style={styles.eventItem}
          onPress={() => navigation.navigate("EventDetails", { eventId: item.id })}
        >
          <Text style={styles.eventText}>{item.title}</Text>
          <Text style={styles.eventDate}>{formattedDate}</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const sections = [
    { title: "Profile Info", data: [{}] },
    { title: "About Me", data: [{}] },
    { title: "Interests", data: [{}] },
    { title: "Photos", data: [{}] },
    {
      title: "Events Visited",
      data: eventsVisited.length > 0
        ? eventsVisited
        : [{ id: "none", title: "No events visited yet", event_date: "" }],
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#668CFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to load profile.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isOwnProfile ? "My Profile" : `${profile.username}'s Profile`}
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.sectionListContent}
      />

      {editMode && isOwnProfile && (
        <Animated.View style={[styles.editPanel, { transform: [{ translateY: slideAnim }] }]}>
          <ScrollView style={styles.editScroll} contentContainerStyle={styles.editScrollContent}>
            <Text style={styles.editHeader}>Edit Profile</Text>

            <Text style={styles.editLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
            />

            <Text style={styles.editLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.editLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
            />

            <Text style={styles.editLabel}>Bio</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Enter your bio..."
            />

            <Text style={styles.editLabel}>Profile Picture</Text>
            <View style={styles.photoRow}>
              {profilePic ? (
                <Image source={{ uri: getProfilePicUrl(profilePic) }} style={styles.profilePicPreview} />
              ) : (
                <Text style={styles.noPhotosText}>No image</Text>
              )}
              <TouchableOpacity style={styles.editPhotoButton} onPress={pickProfilePic}>
                <Ionicons name="image-outline" size={24} color="#0A58CA" />
                <Text style={styles.editPhotoText}>Change</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.editLabel}>Select up to 9 Interests</Text>
            <View style={styles.editInterestsContainer}>
              {INTEREST_OPTIONS.map((interest, index) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.interestOption,
                      isSelected && { backgroundColor: RAINBOW_COLORS[index % RAINBOW_COLORS.length] },
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={[styles.interestOptionText, isSelected && { color: "#fff" }]}>{interest}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={closeEditPanel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#fff" },
  sectionListContent: { paddingBottom: 20, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red" },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    height: 100,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerLeft: {
    position: "absolute",
    left: 20,
    top: "50%",
    transform: [{ translateY: 20 }],
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "AirbnbCereal_Md",
    color: "#333",
    marginTop: 65,
  },
  profileInfo: { alignItems: "center", marginBottom: 20 },
  profilePic: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  profileDetails: { alignItems: "center" },
  profileName: { fontSize: 20, fontFamily: "AirbnbCereal_Md" },
  onlineStatus: { fontSize: 14, color: "green", fontFamily: "AirbnbCereal_Lt" },
  followEditContainer: { alignItems: "center", marginTop: 10 },
  followersText: { fontSize: 16, fontFamily: "AirbnbCereal_Md" },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#0A58CA",
    borderRadius: 25,
    marginTop: 10,
    height: 50,
  },
  editProfileText: { color: "#0A58CA", fontFamily: "AirbnbCereal_Md", marginLeft: 5 },
  sectionTitle: { fontSize: 18, fontFamily: "AirbnbCereal_Md", marginBottom: 10, marginTop: 20 },
  bioText: { fontSize: 14, fontFamily: "AirbnbCereal_Lt", marginBottom: 10 },
  interestsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  interestBubble: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginRight: 5, marginBottom: 5 },
  interestText: { fontFamily: "AirbnbCereal_Md", fontSize: 14 },
  noInterestsText: { fontSize: 14, color: "gray" },
  noPhotosText: { fontSize: 14, color: "gray", textAlign: "center" },
  eventText: { fontSize: 14, fontFamily: "AirbnbCereal_Lt", marginBottom: 5 },
  eventDate: { fontSize: 12, fontFamily: "AirbnbCereal_Lt", color: "gray" },
  editPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    height: windowHeight,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 99,
    elevation: 10,
  },
  editScroll: { flex: 1 },
  editScrollContent: { padding: 20, paddingBottom: 200 },
  editHeader: { fontSize: 24, fontFamily: "AirbnbCereal_Md", marginBottom: 20, textAlign: "center" },
  editLabel: { fontSize: 16, fontFamily: "AirbnbCereal_Md", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 15, fontSize: 16, fontFamily: "AirbnbCereal_Md", marginBottom: 15 },
  photoRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  profilePicPreview: { width: 80, height: 80, borderRadius: 40, marginRight: 10 },
  editPhotoButton: { flexDirection: "row", alignItems: "center" },
  editPhotoText: { fontSize: 16, fontFamily: "AirbnbCereal_Md", marginLeft: 5, color: "#0A58CA" },
  editInterestsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  interestOption: { width: "48%", borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingVertical: 8, marginBottom: 8, alignItems: "center" },
  interestOptionText: { fontFamily: "AirbnbCereal_Md", fontSize: 14, color: "#333" },
  buttonRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  saveButton: { backgroundColor: "#0A58CA", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
  saveButtonText: { color: "#fff", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
  cancelButton: { backgroundColor: "#ccc", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
  cancelButtonText: { color: "#333", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
  photosHeader: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginBottom: 10 },
  addPhotoButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: "#668CFF", borderRadius: 15 },
  addPhotoText: { color: "#668CFF", fontFamily: "AirbnbCereal_Md", marginLeft: 5 },
  photosContainer: { flexDirection: "row" },
  photoItem: { marginRight: 10, position: "relative" },
  photo: { width: 150, height: 150, borderRadius: 10 },
  photoCaption: { fontSize: 12, color: "#666", textAlign: "center", marginTop: 5 },
  deletePhotoButton: { position: "absolute", top: 5, right: 5, backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: 15, padding: 5 },
  eventItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  noEventsText: { fontSize: 14, color: "gray", textAlign: "center", marginVertical: 10 },
});

export default ProfileScreen;