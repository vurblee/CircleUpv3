import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Animated,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
<<<<<<< HEAD
import * as ImagePicker from "expo-image-picker";
import { decode as atob } from "base-64";

const { height: windowHeight } = Dimensions.get("window");

=======
import * as ImagePicker from "expo-image-picker"; // Ensure you've installed expo-image-picker
import { decode as atob } from "base-64";

// The total height of the screen
const { height: windowHeight } = Dimensions.get("window");

// Pre-defined interest options
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
const INTEREST_OPTIONS = [
  "Fishing", "Cooking", "Travel", "Photography", "Reading", "Cycling", "Running",
  "Yoga", "Dancing", "Swimming", "Coding", "Music", "Movies", "Theater", "Art",
  "Fashion", "Gaming", "Technology", "Fitness", "Blogging", "DIY", "Volunteering",
  "Camping", "Skiing", "Snowboarding", "Surfing", "Bowling", "Golf", "Tennis",
  "Badminton", "Rugby", "Cricket", "Baseball", "Soccer", "Basketball", "Boxing",
  "Martial Arts", "Wine Tasting", "Chess", "Hiking", "Lime", "Magenta", "Coral",
  "Mint", "Lavender", "Peach", "Cerulean", "Periwinkle", "Rose", "Salmon"
];

<<<<<<< HEAD
const RAINBOW_COLORS = [
  "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF",
  "#FF1493", "#00CED1",
=======
// Some rainbow-like colors for selected bubbles
const RAINBOW_COLORS = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#FFFF00", // Yellow
  "#00FF00", // Green
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#8B00FF", // Violet
  "#FF1493", // DeepPink
  "#00CED1", // DarkTurquoise
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
];

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
<<<<<<< HEAD
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

// Add this helper function at the top of your file (e.g., after your imports)
const getProfilePicUrl = (pic: string) => {
  if (!pic) return "https://via.placeholder.com/100";
  // If the picture already contains an absolute URL, return as is.
  if (pic.startsWith("http://") || pic.startsWith("https://")) return pic;
  // Otherwise, assume it’s a relative path and prefix with your backend URL.
  return `http://192.168.1.231:5000/${pic}`;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const slideAnim = useRef(new Animated.Value(windowHeight)).current;

=======
      Array.prototype.map
        .call(atob(base64), (c: any) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error: any) {
    throw new Error("Failed to decode JWT: " + error.message);
  }
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Profile data from backend
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Whether edit panel is open
  const [editMode, setEditMode] = useState(false);

  // Animated value for sliding panel
  const slideAnim = useRef(new Animated.Value(windowHeight)).current;

  // Fields for editing
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<string>("");

<<<<<<< HEAD
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "No authentication token found. Please sign in.");
        navigation.navigate("SignIn");
=======
  // Re-fetch user profile from backend
  const fetchProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.warn("No token found in AsyncStorage");
        setLoading(false);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        return;
      }
      const decodedToken = decodeJwt(token);
      const userId = decodedToken.userId;

<<<<<<< HEAD
      const response = await axios.get(
        `http://192.168.1.231:5000/api/users/${userId}?timestamp=${Date.now()}`,
=======
      // Append a timestamp to avoid caching
      const response = await axios.get(
        `http://10.0.2.2:5000/api/users/${userId}?timestamp=${Date.now()}`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(response.data);
<<<<<<< HEAD
=======

      // Prepopulate the edit fields
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      setEditName(response.data.name || "");
      setEditEmail(response.data.email || "");
      setEditUsername(response.data.username || "");
      setEditBio(response.data.bio || "");
      setSelectedInterests(response.data.interests || []);
      setProfilePic(response.data.profile_picture || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
<<<<<<< HEAD
      Alert.alert("Error", "Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
=======
    } finally {
      setLoading(false);
    }
  }, []);

  // UseFocusEffect to fetch profile on screen focus
  useFocusEffect(
    React.useCallback(() => {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      fetchProfile();
    }, [fetchProfile])
  );

<<<<<<< HEAD
  const openEditPanel = () => {
    setEditMode(true);
    Animated.timing(slideAnim, {
      toValue: windowHeight * 0.25,
=======
  // Slide the panel up
  const openEditPanel = () => {
    setEditMode(true);
    Animated.timing(slideAnim, {
      toValue: windowHeight * 0.25, // The top "resting" position for the panel
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

<<<<<<< HEAD
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
        const uri = result.assets[0].uri;
        const lowerUri = uri.toLowerCase();
        if (!lowerUri.endsWith(".jpg") && !lowerUri.endsWith(".jpeg") && !lowerUri.endsWith(".png")) {
          Alert.alert("Invalid File", "Only JPG, JPEG, or PNG files are allowed.");
=======
  // Slide the panel down
  const closeEditPanel = () => {
    Animated.timing(slideAnim, {
      toValue: windowHeight, // Slide out of screen
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setEditMode(false);
    });
  };

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      // Deselect
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      // Limit to 9
      if (selectedInterests.length >= 9) {
        Alert.alert("Limit Reached", "You can only select up to 9 interests.");
      } else {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  // Pick a new profile pic
  const pickProfilePic = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Please allow media library access.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // The updated enum usage
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.cancelled) {
        // Check file extension
        const uri = result.uri;
        const lower = uri.toLowerCase();
        if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.endsWith(".png")) {
          Alert.alert("Invalid file type", "Only .jpg, .jpeg, or .png is allowed.");
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          return;
        }
        setProfilePic(uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
<<<<<<< HEAD
      Alert.alert("Error", "Failed to pick image.");
    }
  };

=======
    }
  };

  // Save the edited profile
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");
      if (!token || !userId) {
<<<<<<< HEAD
        throw new Error("Missing token or userId");
      }

      // Upload the profile picture to S3
      let profilePicUrl = profile.profile_picture;
      if (profilePic && profilePic.startsWith("file://")) {
        const profilePicData = new FormData();
        profilePicData.append("profile_picture", {
          uri: profilePic,
          name: `profile-${userId}.${profilePic.split(".").pop()}`,
          type: `image/${profilePic.split(".").pop()}`,
        } as any);

        const uploadResponse = await axios.post(`http://192.168.1.231:5000/api/users/${userId}/profile-picture`, profilePicData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        profilePicUrl = uploadResponse.data.profile_picture;
      }

      // Update the profile with the new data
      const formData = new FormData();
      formData.append("name", editName.trim() ? editName : profile.name);
      formData.append("email", editEmail.trim() ? editEmail : profile.email);
      formData.append("username", editUsername.trim() ? editUsername : profile.username);
      formData.append("bio", editBio || profile.bio || "");
      formData.append("interests", JSON.stringify(selectedInterests.length ? selectedInterests : profile.interests || []));
      formData.append("profile_picture", profilePicUrl);

      await axios.put(`http://192.168.1.231:5000/api/users/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Profile updated successfully!");
      await fetchProfile();
      closeEditPanel();
    } catch (error) {
=======
        throw new Error("Missing token or userId in AsyncStorage");
      }
      const updatedProfile = {
        name: editName,
        email: editEmail,
        username: editUsername,
        bio: editBio,
        interests: selectedInterests,
        profile_picture: profilePic,
      };
      // PUT request to backend
      await axios.put(
        `http://10.0.2.2:5000/api/users/${userId}`,
        updatedProfile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "Profile updated successfully!");
      // Refresh
      await fetchProfile();
      // Close the panel
      closeEditPanel();
    } catch (error: any) {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      console.error("Error updating profile:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

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

<<<<<<< HEAD
  console.log("Profile picture URL:", getProfilePicUrl(profile.profile_picture));

  return (
    <View style={styles.screenContainer}>
      {/* Custom Header — matching other screens */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerLeft}
        >
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.mainScroll}>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: getProfilePicUrl(profile.profile_picture) }}
            style={styles.profilePic}
            onError={(e) => console.log("Image error: ", e.nativeEvent.error)}
=======
  return (
    <View style={styles.screenContainer}>
      {/* Main Profile Content */}
      <ScrollView style={styles.mainScroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
            <Text style={styles.headerTitle}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchProfile}>
            <Ionicons name="refresh" size={24} color="#0A58CA" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image
            source={
              profile.profile_picture
                ? { uri: profile.profile_picture }
                : { uri: "https://via.placeholder.com/100" }
            }
            style={styles.profilePic}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.onlineStatus}>
              {profile.is_online ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

<<<<<<< HEAD
=======
        {/* Followers and Edit Profile */}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        <View style={styles.followEditContainer}>
          <Text style={styles.followersText}>
            {profile.following || 0} Following | {profile.followers || 0} Followers
          </Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={openEditPanel}>
            <Ionicons name="create-outline" size={18} color="#668CFF" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

<<<<<<< HEAD
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bioText}>
            {profile.bio && profile.bio.trim() ? profile.bio : "No bio provided."}
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Interests</Text>
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
=======
        {/* About Me */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bioText}>
            {profile.bio && profile.bio.trim() !== ""
              ? profile.bio
              : "No bio provided. Click Edit Profile to add your bio."}
          </Text>
        </View>

        {/* Interests */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {profile.interests && profile.interests.length > 0 ? (
              profile.interests.map((interest: string, idx: number) => (
                <View key={idx} style={styles.interestBubble}>
                  <Text style={styles.interestText}>{interest}</Text>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                </View>
              ))
            ) : (
              <Text style={styles.noInterestsText}>No interests added.</Text>
            )}
          </View>
        </View>

<<<<<<< HEAD
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Photos</Text>
          {profile.photos?.length > 0 ? (
=======
        {/* Photos */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Photos</Text>
          {profile.photos && profile.photos.length > 0 ? (
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            <Image source={{ uri: profile.photos[0] }} style={styles.samplePhoto} />
          ) : (
            <Text style={styles.noPhotosText}>No photos available.</Text>
          )}
        </View>

<<<<<<< HEAD
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Events Visited</Text>
          {profile.events_visited?.length > 0 ? (
            profile.events_visited.map((event: any, idx: number) => (
              <Text key={idx} style={styles.eventText}>{event}</Text>
=======
        {/* Events Visited */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Events Visited</Text>
          {profile.events_visited && profile.events_visited.length > 0 ? (
            profile.events_visited.map((event: any, idx: number) => (
              <Text key={idx} style={styles.eventText}>
                {event}
              </Text>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            ))
          ) : (
            <Text style={styles.noEventsText}>No events visited yet.</Text>
          )}
        </View>
      </ScrollView>

<<<<<<< HEAD
      {editMode && (
        <Animated.View style={[styles.editPanel, { transform: [{ translateY: slideAnim }] }]}>
          <ScrollView style={styles.editScroll} contentContainerStyle={styles.editScrollContent}>
            <Text style={styles.editHeader}>Edit Profile</Text>

=======
      {/* Sliding Edit Panel */}
      {editMode && (
        <Animated.View
          style={[
            styles.editPanel,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Make this scrollable with extra bottom padding so the user can see the Save button */}
          <ScrollView
            style={styles.editScroll}
            contentContainerStyle={styles.editScrollContent}
          >
            <Text style={styles.editHeader}>Edit Profile</Text>

            {/* Name */}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            <Text style={styles.editLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
            />

<<<<<<< HEAD
=======
            {/* Email */}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            <Text style={styles.editLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

<<<<<<< HEAD
=======
            {/* Username */}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            <Text style={styles.editLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
            />

<<<<<<< HEAD
=======
            {/* Bio */}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            <Text style={styles.editLabel}>Bio</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Enter your bio..."
            />

<<<<<<< HEAD
            <Text style={styles.editLabel}>Profile Picture</Text>
            <View style={styles.photoRow}>
              {profilePic ? (
                <Image
                  source={{ uri: getProfilePicUrl(profilePic) }}
                  style={styles.profilePicPreview}
                />
=======
            {/* Profile Picture */}
            <Text style={styles.editLabel}>Profile Picture</Text>
            <View style={styles.photoRow}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.profilePicPreview} />
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              ) : (
                <Text style={styles.noPhotosText}>No image</Text>
              )}
              <TouchableOpacity style={styles.editPhotoButton} onPress={pickProfilePic}>
                <Ionicons name="image-outline" size={24} color="#0A58CA" />
                <Text style={styles.editPhotoText}>Change</Text>
              </TouchableOpacity>
            </View>

<<<<<<< HEAD
=======
            {/* Interests */}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            <Text style={styles.editLabel}>Select up to 9 Interests</Text>
            <View style={styles.editInterestsContainer}>
              {INTEREST_OPTIONS.map((interest, index) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.interestOption,
                      isSelected && {
                        backgroundColor: RAINBOW_COLORS[index % RAINBOW_COLORS.length],
                      },
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text
                      style={[
                        styles.interestOptionText,
                        isSelected && { color: "#fff" },
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

<<<<<<< HEAD
=======
            {/* Buttons Row */}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
<<<<<<< HEAD
  screenContainer: { flex: 1, backgroundColor: "#fff" },
  mainScroll: { flex: 1, paddingTop: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red" },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    height: 100, // Adjusted height to lower the elements
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerLeft: {
    position: "absolute",
    left: 20,
    top: "50%",
    transform: [{ translateY: 20 }], // Adjust based on icon size
  },
  headerTitle: { 
    fontSize: 22,
    fontFamily: "AirbnbCereal_Md", 
    color: "#333",
    marginTop: 65, // Lower the title further by 20 points
=======
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainScroll: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    marginLeft: 10,
    fontFamily: "AirbnbCereal_Md",
  },
  refreshButton: {
    marginLeft: "auto",
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
  },
<<<<<<< HEAD
  profilePic: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  profileDetails: { alignItems: "center", marginLeft: 15 },
  profileName: { fontSize: 20, fontFamily: "AirbnbCereal_Md" },
  onlineStatus: { fontSize: 14, color: "green", fontFamily: "AirbnbCereal_Lt" },
  followEditContainer: { alignItems: "center", marginBottom: 20 },
  followersText: { fontSize: 16, fontFamily: "AirbnbCereal_Md" },
=======
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileDetails: {
    alignItems: "center",
    marginLeft: 15,
  },
  profileName: {
    fontSize: 20,
    fontFamily: "AirbnbCereal_Md",
  },
  onlineStatus: {
    fontSize: 14,
    color: "green",
    fontFamily: "AirbnbCereal_Lt",
  },
  followEditContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  followersText: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
<<<<<<< HEAD
  editProfileText: { color: "#0A58CA", fontFamily: "AirbnbCereal_Md", marginLeft: 5 },
  sectionContainer: { marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontFamily: "AirbnbCereal_Md", marginBottom: 10 },
  bioText: { fontSize: 14, fontFamily: "AirbnbCereal_Lt", marginBottom: 10 },
  interestsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  interestBubble: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginRight: 5, marginBottom: 5 },
  interestText: { fontFamily: "AirbnbCereal_Md", fontSize: 14 },
  noInterestsText: { fontSize: 14, color: "gray" },
  samplePhoto: { width: "100%", height: 150, borderRadius: 10 },
  noPhotosText: { fontSize: 14, color: "gray", textAlign: "center" },
  eventText: { fontSize: 14, fontFamily: "AirbnbCereal_Lt", marginBottom: 10 },
  noEventsText: { fontSize: 14, color: "gray" },
=======
  editProfileText: {
    color: "#0A58CA",
    fontFamily: "AirbnbCereal_Md",
    marginLeft: 5,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "AirbnbCereal_Md",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    fontFamily: "AirbnbCereal_Lt",
    marginBottom: 10,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestBubble: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 5,
    marginBottom: 5,
  },
  interestText: {
    fontFamily: "AirbnbCereal_Md",
    fontSize: 14,
  },
  noInterestsText: {
    fontSize: 14,
    color: "gray",
  },
  samplePhoto: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  noPhotosText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  eventText: {
    fontSize: 14,
    fontFamily: "AirbnbCereal_Lt",
    marginBottom: 10,
  },
  noEventsText: {
    fontSize: 14,
    color: "gray",
  },

  // Edit Panel
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  editPanel: {
    position: "absolute",
    left: 0,
    right: 0,
<<<<<<< HEAD
    height: windowHeight,
=======
    height: windowHeight, // Fill the screen
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 99,
    elevation: 10,
  },
<<<<<<< HEAD
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
});

export default ProfileScreen;
=======
  editScroll: {
    flex: 1,
  },
  // Extra bottom padding so the user can scroll down to see the Save/Cancel buttons
  editScrollContent: {
    padding: 20,
    paddingBottom: 200, // Enough space to ensure bottom content is visible
  },
  editHeader: {
    fontSize: 24,
    fontFamily: "AirbnbCereal_Md",
    marginBottom: 20,
    textAlign: "center",
  },
  editLabel: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    marginBottom: 15,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  profilePicPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  editPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editPhotoText: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    marginLeft: 5,
    color: "#0A58CA",
  },
  editInterestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  interestOption: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  interestOptionText: {
    fontFamily: "AirbnbCereal_Md",
    fontSize: 14,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#0A58CA",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
});

export default ProfileScreen;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
