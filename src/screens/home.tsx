import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Animated,
  Pressable,
  TextInput,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useFonts } from "expo-font";
import apiClient from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDateString } from "../utils/dateUtils";
import { useTheme } from "../../src/providers/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import HapticButton from "../components/hapticbutton";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";

const { width, height: windowHeight } = Dimensions.get("window");

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

const HomePage = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [fontsLoaded] = useFonts({
    "AirbnbCereal-Medium": require("../../assets/fonts/AirbnbCereal_W_Md.otf"),
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const borderRadiusAnim = useState(new Animated.Value(0))[0];

  const [showPostModal, setShowPostModal] = useState(false);
  const postModalAnim = useState(new Animated.Value(windowHeight))[0];
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [isEvent, setIsEvent] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);

  const [eventYear, setEventYear] = useState(new Date().getFullYear().toString());
  const [eventMonth, setEventMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [eventDay, setEventDay] = useState(new Date().getDate().toString().padStart(2, "0"));
  const [eventHour, setEventHour] = useState("12");
  const [eventMinute, setEventMinute] = useState("00");
  const [eventAmPm, setEventAmPm] = useState("AM");
  const [bannerPhotoUri, setBannerPhotoUri] = useState(null);
  const [imageId, setImageId] = useState(null);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [deletedConversations, setDeletedConversations] = useState([]);
  const [activeTab, setActiveTab] = useState("current");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const popupAnim = useRef(new Animated.Value(-300)).current;

  const [currentUserName, setCurrentUserName] = useState("User Name");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userProfilePic, setUserProfilePic] = useState("https://via.placeholder.com/70");

  const [filterVisible, setFilterVisible] = useState(false);
  const [filterFriendsOnly, setFilterFriendsOnly] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterPostType, setFilterPostType] = useState("all");

  const [fabScale] = useState(new Animated.Value(1));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [isEditingEventDetails, setIsEditingEventDetails] = useState(false);

  const [userLocation, setUserLocation] = useState("New York, USA");
  const [locationLoading, setLocationLoading] = useState(false);

  const [locationInput, setLocationInput] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);

  const loadCurrentUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      setCurrentUserId(storedUserId);
    } catch (error) {
      console.error("Error loading current user id:", error);
    }
  };

  const fetchCurrentUserProfile = async () => {
    try {
      if (!currentUserId) return;
      const response = await apiClient.get(`/users/${currentUserId}`);
      const userData = response.data;
      setUserProfilePic(userData.profile_picture || "https://via.placeholder.com/70");
      setCurrentUserName(userData.username || userData.name || "User Name");
    } catch (error) {
      console.error("Error fetching user profile:", error.response?.data || error.message);
      setUserProfilePic("https://via.placeholder.com/70");
      setCurrentUserName("User Name");
    }
  };

  const fetchFriendsList = async () => {
    try {
      const response = await apiClient.get("/friends");
      setFriendsList(response.data);
    } catch (error) {
      console.error("Error fetching friends list:", error);
    }
  };

  useEffect(() => {
    if (filterVisible && filterFriendsOnly && friendsList.length === 0) {
      fetchFriendsList();
    }
  }, [filterVisible, filterFriendsOnly]);

  useEffect(() => {
    const initialize = async () => {
      await loadCurrentUserId();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchCurrentUserProfile();
      fetchUpcomingEvents();
      fetchFeedPosts();
      fetchConversations();
    }
  }, [currentUserId]);

  const toggleFriendSelection = (friendId) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      animatePopupDown();
      return;
    }
    animatePopupUp();
    try {
      setSearchLoading(true);
      const [usersRes, postsRes] = await Promise.all([
        apiClient.get("/users/search", { params: { query } }),
        apiClient.get("/posts/search", { params: { query } }),
      ]);
      const userResults = usersRes.data.map((u) => ({ ...u, type: "user" }));
      const postResults = postsRes.data.map((p) => ({ ...p, type: p.is_event ? "event" : "post" }));
      setSearchResults([...userResults, ...postResults]);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await apiClient.get("/posts/upcoming-events");
      const eventsWithDetails = await Promise.all(
        response.data.map(async (event) => {
          const eventDetails = await apiClient.get(`/posts/${event.id}`);
          return {
            ...event,
            banner_photo: eventDetails.data.banner_photo,
            total_likes: parseInt(eventDetails.data.total_likes) || 0,
            user_liked: eventDetails.data.user_liked || false,
            location: eventDetails.data.location || "No location provided",
          };
        })
      );
      setUpcomingEvents(eventsWithDetails);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchFeedPosts = async () => {
    try {
      setLoadingFeed(true);
      const response = await apiClient.get("/posts");
      const postsWithDetails = await Promise.all(
        response.data.map(async (post) => {
          const postDetails = await apiClient.get(`/posts/${post.id}`);
          return {
            ...post,
            banner_photo: postDetails.data.banner_photo,
            total_likes: parseInt(postDetails.data.total_likes) || 0,
            user_liked: postDetails.data.user_liked || false,
            location: postDetails.data.location || "No location provided",
          };
        })
      );
      setFeedPosts(postsWithDetails);
    } catch (error) {
      console.error("Error fetching feed posts:", error.response?.data || error.message);
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleRefresh = () => {
    setLoadingEvents(true);
    setLoadingFeed(true);
    fetchUpcomingEvents();
    fetchFeedPosts();
  };

  const applyFeedFilters = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterFriendsOnly) queryParams.append("friendsOnly", "true");
      if (selectedFriendIds.length > 0) queryParams.append("friendIds", selectedFriendIds.join(","));
      if (filterStartDate) queryParams.append("startDate", filterStartDate);
      if (filterEndDate) queryParams.append("endDate", filterEndDate);
      if (filterPostType !== "all") queryParams.append("eventType", filterPostType);

      const response = await apiClient.get(`/posts/filter?${queryParams.toString()}`);
      const postsWithDetails = await Promise.all(
        response.data.map(async (post) => {
          const postDetails = await apiClient.get(`/posts/${post.id}`);
          return {
            ...post,
            banner_photo: postDetails.data.banner_photo,
            total_likes: parseInt(postDetails.data.total_likes) || 0,
            user_liked: postDetails.data.user_liked || false,
            city_name: postDetails.data.city_name,
            state_name: postDetails.data.state_name,
          };
        })
      );
      setFeedPosts(postsWithDetails);
      setFilterVisible(false);
    } catch (error) {
      console.error("Error applying feed filters:", error);
      Alert.alert("Error", "Could not apply filters.");
    }
  };

  const clearFilters = () => {
    setFilterFriendsOnly(false);
    setSelectedFriendIds([]);
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterPostType("all");
  };

  const fetchConversations = async () => {
    try {
      const response = await apiClient.get("/conversations");
      setConversations(response.data);
      setDeletedConversations([]);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      Alert.alert("Error", "Unable to fetch conversations.");
    }
  };

  useEffect(() => {
    if (eventYear && eventMonth && eventDay && eventHour && eventMinute && eventAmPm) {
      const hour24 = eventAmPm === "PM" && eventHour !== "12" ? parseInt(eventHour) + 12 :
        eventAmPm === "AM" && eventHour === "12" ? "00" : eventHour;
      setEventDate(`${eventYear}-${eventMonth}-${eventDay} ${hour24}:${eventMinute}:00`);
    }
  }, [eventYear, eventMonth, eventDay, eventHour, eventMinute, eventAmPm]);

  const toggleMenu = () => {
    if (!menuVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 300, useNativeDriver: true }),
        Animated.timing(borderRadiusAnim, { toValue: 20, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -300, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(borderRadiusAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
    setMenuVisible(!menuVisible);
  };

  const openPostModal = () => {
    setShowPostModal(true);
    Animated.timing(postModalAnim, { toValue: windowHeight * 0.1, duration: 300, useNativeDriver: false }).start();
  };

  const closePostModal = () => {
    Animated.timing(postModalAnim, { toValue: windowHeight, duration: 300, useNativeDriver: false }).start(() => {
      setShowPostModal(false);
      setPostTitle("");
      setPostContent("");
      setIsEvent(false);
      setEventDate("");
      setEventYear(new Date().getFullYear().toString());
      setEventMonth((new Date().getMonth() + 1).toString().padStart(2, "0"));
      setEventDay(new Date().getDate().toString().padStart(2, "0"));
      setEventHour("12");
      setEventMinute("00");
      setEventAmPm("AM");
      setBannerPhotoUri(null);
      setImageId(null);
      setEditingPostId(null);
    });
  };

  const handleSubmitPost = async () => {
    if (!postTitle || !postContent) {
      Alert.alert("Error", "Title and content are required.");
      return;
    }
    if (isEvent && (!latitude || !longitude)) {
      Alert.alert("Error", "Please set a valid location for the event.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", postTitle);
      formData.append("content", postContent);
      formData.append("is_event", isEvent.toString());
      if (isEvent) {
        formData.append("event_date", eventDate);
        formData.append("location", locationInput);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
      }

      if (isEvent && bannerPhotoUri) {
        const uriParts = bannerPhotoUri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("banner_photo", {
          uri: bannerPhotoUri,
          name: `banner-${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      let response;
      if (editingPostId) {
        response = await apiClient.put(`/posts/${editingPostId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await apiClient.post("/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await fetchFeedPosts();
      await fetchUpcomingEvents();
      closePostModal();
      Alert.alert("Success", editingPostId ? "Post updated successfully!" : "Post created successfully!");
    } catch (error) {
      console.error("Error submitting post:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not submit post.");
    }
  };

  const handleDeletePost = async (postId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this post/event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/posts/${postId}`);
            fetchFeedPosts();
            fetchUpcomingEvents();
            Alert.alert("Success", "Post/Event deleted successfully!");
          } catch (error) {
            console.error("Error deleting post:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "Could not delete post/event.");
          }
        },
      },
    ]);
  };

  const handleEditPost = (item) => {
    setEditingPostId(item.id);
    setPostTitle(item.title);
    setPostContent(item.content);
    setIsEvent(item.is_event);
    setBannerPhotoUri(item.banner_photo || null);
    setImageId(item.image_id || null);
    if (item.event_date) {
      const date = new Date(item.event_date);
      setEventYear(date.getFullYear().toString());
      setEventMonth((date.getMonth() + 1).toString().padStart(2, "0"));
      setEventDay(date.getDate().toString().padStart(2, "0"));
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setEventHour(hours.toString().padStart(2, "0"));
      setEventMinute(minutes);
      setEventAmPm(ampm);
    }
    setShowPostModal(true);
    Animated.timing(postModalAnim, { toValue: windowHeight * 0.1, duration: 300, useNativeDriver: false }).start();
  };

  const animatePopupUp = () => {
    Animated.timing(popupAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const animatePopupDown = () => {
    Animated.timing(popupAnim, { toValue: -300, duration: 300, useNativeDriver: true }).start();
  };

  const uploadBannerPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow access to your media library.");
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets) {
        const localUri = result.assets[0].uri;
        Alert.alert("Success", "Banner photo selected successfully!");
        return localUri;
      }
      return null;
    } catch (error) {
      console.error("Error selecting banner photo:", error.message);
      Alert.alert("Error", "Failed to select banner photo.");
      return null;
    }
  };

  const fetchUserLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow location access to fetch your current location.");
        setUserLocation("Location unavailable");
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;

      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const { city, country } = address[0];
        setUserLocation(`${city || "Unknown City"}, ${country || "Unknown Country"}`);
      } else {
        setUserLocation("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert("Error", "Could not fetch location.");
      setUserLocation("Location unavailable");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSetLocation = async () => {
    if (!locationInput.trim()) {
      Alert.alert("Error", "Please enter a location.");
      return;
    }

    try {
      const geocodedLocation = await Location.geocodeAsync(locationInput);
      if (geocodedLocation.length > 0) {
        const { latitude, longitude } = geocodedLocation[0];
        setLatitude(latitude);
        setLongitude(longitude);
        setMapVisible(true);
      } else {
        Alert.alert("Error", "Could not find the location. Please try again.");
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
      Alert.alert("Error", "Could not process the location. Please try again.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeedPosts();
      fetchUpcomingEvents();
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      {(!fontsLoaded || loadingEvents || loadingFeed) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <View style={styles.container}>
          <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.profileHeader}>
              <Image source={{ uri: userProfilePic }} style={styles.profilePic} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{currentUserName || "User Name"}</Text>
                <View style={styles.onlineStatusContainer}>
                  <View style={styles.onlineIndicator} />
                  <HapticButton style={styles.onlineToggleButton} onPress={() => { }}>
                    <Text style={styles.onlineToggleText}>Online</Text>
                  </HapticButton>
                </View>
              </View>
            </View>
            <HapticButton style={styles.menuItem} onPress={() => navigation.navigate("Profile")}>
              <Ionicons name="person-outline" size={22} color="#000" />
              <Text style={styles.menuText}>My Profile</Text>
            </HapticButton>
            <HapticButton style={styles.menuItem} onPress={() => navigation.navigate("Map")}>
              <Ionicons name="map-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Map</Text>
            </HapticButton>
            <HapticButton style={styles.menuItem} onPress={() => navigation.navigate("FriendsScreen")}>
              <Ionicons name="people-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Friends</Text>
            </HapticButton>
            <HapticButton style={styles.menuItem} onPress={() => navigation.navigate("Messages")}>
              <Ionicons name="chatbubble-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Messages</Text>
            </HapticButton>
            <HapticButton style={styles.menuItem} onPress={() => navigation.navigate("Events")}>
              <Ionicons name="calendar-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Events</Text>
            </HapticButton>
            {/* New Buttons */}
            <HapticButton style={styles.menuItem} onPress={() => navigation.navigate("DailyInspirationScreen")}>
              <Ionicons name="bulb-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Daily Inspiration</Text>
            </HapticButton>
            <HapticButton style={styles.menuItem} onPress={() => navigation.navigate("CommunitiesScreen")}>
              <Ionicons name="people-circle-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Communities</Text>
            </HapticButton>
            {/* End of New Buttons */}
            <HapticButton style={styles.menuItem} onPress={() => navigation.navigate("SupportFAQ")}>
              <Ionicons name="help-circle-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Support & FAQ</Text>
            </HapticButton>
            <HapticButton style={styles.menuItem} onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Settings</Text>
            </HapticButton>
            <HapticButton style={styles.menuItem} onPress={() => navigation.navigate("SignIn")}>
              <Ionicons name="log-out-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Sign Out</Text>
            </HapticButton>
          </Animated.View>

          <Pressable style={styles.overlay} onPress={menuVisible ? toggleMenu : undefined}>
            <Animated.View style={[styles.homeScreen, { transform: [{ scale: scaleAnim }], borderRadius: borderRadiusAnim }]}>
              <LinearGradient
                colors={
                  theme.mode === "blackAndWhite"
                    ? ["#000000", "#ffffff"]
                    : [theme.primary, `${theme.primary}CC`]
                }
                locations={theme.mode === "blackAndWhite" ? [0, 0.95] : undefined}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 2 }}
              >
                <HapticButton style={styles.menuButton} onPress={toggleMenu}>
                  <Ionicons name="menu" size={28} color="#fff" />
                </HapticButton>
                <HapticButton
                  style={styles.notificationIcon}
                  onPress={() => navigation.navigate("NotificationsScreen")}
                >
                  <Ionicons name="notifications-outline" size={24} color="#fff" />
                </HapticButton>
                <View style={styles.locationContainer}>
                  <HapticButton onPress={fetchUserLocation}>
                    <Text style={styles.locationTitle}>Current Location</Text>
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.locationText}>{userLocation}</Text>
                    )}
                  </HapticButton>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
                  <View style={[styles.searchContainer, { flex: 1, backgroundColor: "transparent" }]}>
                    <Ionicons
                      name="search-outline"
                      size={18}
                      color="#fff"  // force white color
                      style={{ marginLeft: 10 }}
                    />
                    <Text
                      style={{
                        color: "#fff",
                        marginHorizontal: 5,
                        fontSize: 20
                      }}
                    >
                      |
                    </Text>
                    <TextInput
                      style={[styles.searchInput, { fontSize: 20, color: "#fff" }]}
                      placeholder="Search..."
                      placeholderTextColor="#fff" // set a lighter gray for placeholder
                      value={searchQuery}
                      onChangeText={handleSearch}
                      onBlur={() => {
                        setTimeout(() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          animatePopupDown();
                        }, 250);
                      }}
                    />
                  </View>
                  <HapticButton
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor: "rgba(255, 255, 255, 0.2)", // Match transparency
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8, // Match shadow opacity
                        shadowRadius: 2,
                        elevation: 5,
                      },
                    ]}
                    onPress={() => setFilterVisible(true)}
                  >
                    <Text style={styles.filterText}>Filters</Text>
                    <Ionicons
                      name="options-outline"
                      size={16}
                      color="#fff" // Keep the icon color consistent
                      style={{ marginLeft: 4 }}
                    />
                  </HapticButton>
                </View>
                <LinearGradient
                  colors={["transparent", "rgba(255, 255, 255, 0.05)"]}
                  style={styles.headerGloss}
                  pointerEvents="none"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0, 0, 0, 0.1)"]} // Adjust colors for the 3D effect
                  style={styles.header3DEffect}
                />
              </LinearGradient>

              <Modal transparent visible={filterVisible} animationType="slide">
                <View style={styles.filterOverlay}>
                  <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill}>
                    <LinearGradient
                      colors={["rgba(0,122,255,0.3)", "rgba(0,85,181,0.3)"]}
                      style={StyleSheet.absoluteFill}
                    />
                  </BlurView>
                  <View style={styles.filterContainer}>
                    <ScrollView>
                      <Text style={styles.filterTitle}>Filter Feed</Text>
                      <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>Friends Only</Text>
                        <TouchableOpacity onPress={() => setFilterFriendsOnly(!filterFriendsOnly)}>
                          <Ionicons
                            name={filterFriendsOnly ? "checkbox" : "square-outline"}
                            size={24}
                            color={theme.mode === "blackAndWhite" ? "#000" : theme.primary}
                          />
                        </TouchableOpacity>
                      </View>
                      {filterFriendsOnly && (
                        <>
                          <Text style={[styles.filterLabel, { marginTop: 10 }]}>Select Friends</Text>
                          {friendsList.length === 0 ? (
                            <Text style={{ fontSize: 14, color: "#999", marginVertical: 5 }}>No friends found.</Text>
                          ) : (
                            <View style={{ maxHeight: 100, marginVertical: 5 }}>
                              {friendsList.map((friend) => (
                                <View key={friend.id} style={styles.filterRow}>
                                  <Text style={styles.filterLabel}>{friend.name || friend.friend_username || "Unknown"}</Text>
                                  <TouchableOpacity onPress={() => toggleFriendSelection(friend.id)}>
                                    <Ionicons
                                      name={selectedFriendIds.includes(friend.id) ? "checkbox" : "square-outline"}
                                      size={24}
                                      color={theme.mode === "blackAndWhite" ? "#000" : theme.primary} // Black in black-and-white mode
                                    />
                                  </TouchableOpacity>
                                </View>
                              ))}
                            </View>
                          )}
                        </>
                      )}
                      <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>Start Date</Text>
                        <TouchableOpacity
                          style={styles.datePickerButton}
                          onPress={() => setShowStartDatePicker(true)}
                        >
                          <Text style={styles.datePickerText}>
                            {filterStartDate ? new Date(filterStartDate).toLocaleDateString() : "Select Date"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {showStartDatePicker && (
                        <DateTimePicker
                          value={filterStartDate ? new Date(filterStartDate) : new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowStartDatePicker(false);
                            if (selectedDate) {
                              setFilterStartDate(selectedDate.toISOString().split("T")[0]);
                            }
                          }}
                        />
                      )}
                      <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>End Date</Text>
                        <TouchableOpacity
                          style={styles.datePickerButton}
                          onPress={() => setShowEndDatePicker(true)}
                        >
                          <Text style={styles.datePickerText}>
                            {filterEndDate ? new Date(filterEndDate).toLocaleDateString() : "Select Date"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {showEndDatePicker && (
                        <DateTimePicker
                          value={filterEndDate ? new Date(filterEndDate) : new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowEndDatePicker(false);
                            if (selectedDate) {
                              setFilterEndDate(selectedDate.toISOString().split("T")[0]);
                            }
                          }}
                        />
                      )}
                      <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>Post Type</Text>
                        <View style={styles.filterOptions}>
                          <TouchableOpacity onPress={() => setFilterPostType("all")}>
                            <Text style={[styles.filterOption, filterPostType === "all" && styles.filterOptionActive]}>
                              All
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setFilterPostType("false")}>
                            <Text style={[styles.filterOption, filterPostType === "false" && styles.filterOptionActive]}>
                              Posts
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setFilterPostType("true")}>
                            <Text style={[styles.filterOption, filterPostType === "true" && styles.filterOptionActive]}>
                              Events
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </ScrollView>
                    <View style={styles.filterButtonsRow}>
                      <HapticButton style={styles.filterCancelButton} onPress={() => setFilterVisible(false)}>
                        <Text style={styles.filterButtonText}>Cancel</Text>
                      </HapticButton>
                      <HapticButton style={[styles.filterApplyButton, { backgroundColor: "#FFA500" }]} onPress={clearFilters}>
                        <Text style={styles.filterButtonText}>Clear</Text>
                      </HapticButton>
                      <HapticButton
                        style={[
                          styles.filterApplyButton,
                          {
                            backgroundColor: theme.mode === "blackAndWhite" ? "#000" : theme.primary, // Black in black-and-white mode
                          },
                        ]}
                        onPress={applyFeedFilters}
                      >
                        <Text
                          style={[
                            styles.filterButtonText,
                            { color: theme.mode === "blackAndWhite" ? "#fff" : "#fff" }, // White text in black-and-white mode
                          ]}
                        >
                          Apply Filters
                        </Text>
                      </HapticButton>
                    </View>
                  </View>
                </View>
              </Modal>

              <ScrollView style={styles.mainContent}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                <FlatList
                  data={upcomingEvents}
                  horizontal
                  nestedScrollEnabled={true}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => `event-${item.id}-${index}`}
                  renderItem={({ item }) => (
                    <EventItem
                      item={item}
                      navigation={navigation}
                      theme={theme}
                    />
                  )}
                  style={{ marginVertical: 10 }}
                  contentContainerStyle={{ paddingHorizontal: 12 }}
                />
                <View style={styles.feedWrapper}>
                  <Text style={styles.feedSectionTitle}>Feed</Text>
                  <FlatList
                    data={feedPosts}
                    nestedScrollEnabled={true}
                    keyExtractor={(item, index) => `feed-${item.id}-${index}`}
                    renderItem={({ item }) => (
                      <FeedItem
                        item={item}
                        currentUserId={currentUserId}
                        onDelete={handleDeletePost}
                        onEdit={handleEditPost}
                        navigation={navigation}
                        theme={theme}
                      />
                    )}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingTop: 10 }}
                  />
                </View>
              </ScrollView>

              <View style={styles.fabBlueBackground}>
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,1)"]}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: 56,
                    height: 40,
                    borderBottomLeftRadius: 28,
                    borderBottomRightRadius: 28,
                    zIndex: 99,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </View>

              <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
                <LinearGradient
                  colors={
                    theme.mode === "blackAndWhite"
                      ? ["#000000", "#888888"]  // blend from black to dark gray
                      : ["#0A58CA", "#4A90E2"]
                  }
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{
                    position: "absolute",
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    elevation: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                  }}
                />
                <HapticButton
                  onPress={openPostModal}
                  activeOpacity={0.9}
                  style={[
                    styles.fabContent,
                    {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                      elevation: 5,
                    }
                  ]}
                >
                  <Ionicons name="add" size={40} color="#E0E0E0" />
                </HapticButton>
              </Animated.View>

              <View style={styles.navBar}>
                <HapticButton style={styles.navItem} onPress={() => navigation.navigate("Explore")}>
                  <Ionicons
                    name="compass-outline"
                    size={24}
                    color={theme.mode === "blackAndWhite" ? "#000000" : theme.primary}
                  />
                  <Text style={[styles.navText, { color: theme.mode === "blackAndWhite" ? "#000000" : theme.primary }]}>
                    Explore
                  </Text>
                </HapticButton>
                <HapticButton style={styles.navItem} onPress={() => navigation.navigate("Events")}>
                  <Ionicons
                    name="calendar"
                    size={24}
                    color={theme.mode === "blackAndWhite" ? "#000000" : theme.primary}
                  />
                  <Text style={[styles.navText, { color: theme.mode === "blackAndWhite" ? "#000000" : theme.primary }]}>
                    Events
                  </Text>
                </HapticButton>
                <HapticButton style={styles.navItem} onPress={() => navigation.navigate("Messages")}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={24}
                    color={theme.mode === "blackAndWhite" ? "#000000" : theme.primary}
                  />
                  <Text style={[styles.navText, { color: theme.mode === "blackAndWhite" ? "#000000" : theme.primary }]}>
                    Messages
                  </Text>
                </HapticButton>
                <HapticButton style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color={theme.mode === "blackAndWhite" ? "#000000" : theme.primary}
                  />
                  <Text style={[styles.navText, { color: theme.mode === "blackAndWhite" ? "#000000" : theme.primary }]}>
                    Profile
                  </Text>
                </HapticButton>
              </View>
            </Animated.View>
          </Pressable>

          {searchQuery.trim().length > 0 && (
            <Animated.View style={[styles.searchPopup, { transform: [{ translateY: popupAnim }] }]}>
              <View style={styles.searchPopupHeader}>
                <View style={styles.searchPopupHandle} />
                <Text style={styles.searchPopupTitle}>Search Results</Text>
                <HapticButton
                  style={{ position: "absolute", top: 5, right: 10 }}
                  onPress={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    animatePopupDown();
                  }}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </HapticButton>
                {searchLoading && <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: 8 }} />}
              </View>
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
                keyboardShouldPersistTaps="always"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => {
                      if (item.type === "user") {
                        navigation.navigate("Profile", { userId: item.id });
                      } else if (item.type === "event" || item.is_event) {
                        navigation.navigate("EventDetails", { eventId: item.id });
                      } else {
                        navigation.navigate("PostScreen", { postId: item.id });
                      }
                      setSearchQuery("");
                      setSearchResults([]);
                      animatePopupDown();
                    }}
                  >
                    <Text style={styles.searchResultText}>
                      {item.type === "user" ? `User: ${item.name || item.username}` : `Post: ${item.title}`}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  !searchLoading && searchQuery.trim().length > 0 ? (
                    <Text style={{ textAlign: "center", color: "#999", marginVertical: 10 }}>No results found</Text>
                  ) : null
                }
              />
            </Animated.View>
          )}

          {showPostModal && (
            <>
              <BlurView
                intensity={50}
                tint="light"
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
              />
              <Animated.View style={[styles.postModal, { top: postModalAnim }]}>
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={[styles.postModalContent, { flexGrow: 1, paddingBottom: 100 }]}
                  keyboardShouldPersistTaps="handled"
                >
                  <HapticButton onPress={closePostModal} style={styles.modalCloseButton}>
                    <Ionicons name="close" size={24} color="#333" />
                  </HapticButton>
                  <Text style={styles.modalTitle}>{editingPostId ? "Edit Post" : "Create Post"}</Text>
                  <TextInput
                    style={[styles.modalInput, { marginBottom: 20 }]}
                    placeholder="Title"
                    value={postTitle}
                    onChangeText={setPostTitle}
                  />
                  <TextInput
                    style={[styles.modalInput, { height: 150 }]}
                    placeholder="What's on your mind?"
                    multiline
                    value={postContent}
                    onChangeText={setPostContent}
                    returnKeyType="done" // Ensures the keyboard shows a "Done" button
                    blurOnSubmit={true} // Ensures the keyboard dismisses on "Done"
                    onSubmitEditing={Keyboard.dismiss} // Dismisses the keyboard when "Done" is pressed
                  />
                  <View style={styles.eventButtonContainer}>
                    <HapticButton
                      style={[styles.eventButton, !isEvent && styles.eventButtonActive]}
                      onPress={() => setIsEvent(false)}
                    >
                      <Text style={[styles.eventButtonText, !isEvent && { color: "#fff" }]}>Post</Text>
                    </HapticButton>
                    <HapticButton
                      style={[styles.eventButton, isEvent && styles.eventButtonActive]}
                      onPress={() => setIsEvent(true)}
                    >
                      <Text style={[styles.eventButtonText, isEvent && { color: "#fff" }]}>Event</Text>
                    </HapticButton>
                  </View>
                  {isEvent && (
                    <>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setIsEditingEventDetails(!isEditingEventDetails)}
                      >
                        <Text style={styles.editButtonText}>
                          {isEditingEventDetails ? "Done" : "Edit"}
                        </Text>
                      </TouchableOpacity>

                      <Text style={[styles.eventLabel, styles.spacingAbovePicker]}>Event Date</Text>
                      <View style={[styles.pickerRow, styles.pickerContainer]}>
                        {!isEditingEventDetails && (
                          <View style={styles.pickerOverlay} />
                        )}
                        <Picker
                          selectedValue={eventYear}
                          style={styles.picker}
                          itemStyle={{ marginTop: -25 }}
                          onValueChange={(itemValue) => setEventYear(itemValue)}
                          enabled={isEditingEventDetails}
                        >
                          {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                            <Picker.Item key={year} label={year.toString()} value={year.toString()} />
                          ))}
                        </Picker>
                        <Picker
                          selectedValue={eventMonth}
                          style={styles.picker}
                          itemStyle={{ marginTop: -25 }}
                          onValueChange={(itemValue) => setEventMonth(itemValue)}
                          enabled={isEditingEventDetails}
                        >
                          {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((month) => (
                            <Picker.Item key={month} label={month} value={month} />
                          ))}
                        </Picker>
                        <Picker
                          selectedValue={eventDay}
                          style={styles.picker}
                          itemStyle={{ marginTop: -25 }}
                          onValueChange={(itemValue) => setEventDay(itemValue)}
                          enabled={isEditingEventDetails}
                        >
                          {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((day) => (
                            <Picker.Item key={day} label={day} value={day} />
                          ))}
                        </Picker>
                      </View>

                      <Text style={[styles.eventLabel, styles.spacingAbovePicker]}>Time</Text>
                      <View style={[styles.pickerRow, styles.pickerContainer]}>
                        {!isEditingEventDetails && (
                          <View style={styles.pickerOverlay} />
                        )}
                        <Picker
                          selectedValue={eventHour}
                          style={styles.picker}
                          itemStyle={{ marginTop: -25 }}
                          onValueChange={(itemValue) => setEventHour(itemValue)}
                          enabled={isEditingEventDetails}
                        >
                          {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((hour) => (
                            <Picker.Item key={hour} label={hour} value={hour} />
                          ))}
                        </Picker>
                        <Picker
                          selectedValue={eventMinute}
                          style={styles.picker}
                          itemStyle={{ marginTop: -25 }}
                          onValueChange={(itemValue) => setEventMinute(itemValue)}
                          enabled={isEditingEventDetails}
                        >
                          {["00", "15", "30", "45"].map((minute) => (
                            <Picker.Item key={minute} label={minute} value={minute} />
                          ))}
                        </Picker>
                        <Picker
                          selectedValue={eventAmPm}
                          style={styles.picker}
                          itemStyle={{ marginTop: -25 }}
                          onValueChange={(itemValue) => setEventAmPm(itemValue)}
                          enabled={isEditingEventDetails}
                        >
                          <Picker.Item label="AM" value="AM" />
                          <Picker.Item label="PM" value="PM" />
                        </Picker>
                      </View>

                      <Text style={styles.eventLabel}>Location</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Enter location"
                        value={locationInput}
                        onChangeText={setLocationInput}
                      />
                      <TouchableOpacity style={styles.uploadButton} onPress={handleSetLocation}>
                        <Text style={styles.uploadButtonText}>Set Location</Text>
                      </TouchableOpacity>
                      {mapVisible && latitude && longitude && (
                        <MapView
                          style={styles.map}
                          initialRegion={{
                            latitude,
                            longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          }}
                        >
                          <Marker coordinate={{ latitude, longitude }} title="Selected Location" />
                        </MapView>
                      )}

                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={async () => {
                          const uri = await uploadBannerPhoto();
                          if (uri) setBannerPhotoUri(uri);
                        }}
                      >
                        <Text style={styles.uploadButtonText}>
                          {bannerPhotoUri ? "Change Banner Photo" : "Add Banner Photo"}
                        </Text>
                      </TouchableOpacity>
                      {bannerPhotoUri && (
                        <Image source={{ uri: bannerPhotoUri }} style={styles.bannerPreview} />
                      )}
                    </>
                  )}
                  <HapticButton
                    style={[
                      styles.modalSubmitButton,
                      { backgroundColor: theme.mode === "blackAndWhite" ? "#000" : theme.primary }, // Black in black-and-white mode
                    ]}
                    onPress={handleSubmitPost}
                  >
                    <Text
                      style={[
                        styles.modalSubmitText,
                        { color: theme.mode === "blackAndWhite" ? "#fff" : "#fff" }, // White text in black-and-white mode
                      ]}
                    >
                      {editingPostId ? "Update" : isEvent ? "Create Event" : "Post"}
                    </Text>
                  </HapticButton>
                </ScrollView>
              </Animated.View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const FeedItem = ({ item, currentUserId, onDelete, onEdit, navigation, theme }) => {
  const { day, monthName, timeString } = formatDateString(item.created_at);
  const [likeCount, setLikeCount] = useState(parseInt(item.total_likes) || 0);
  const [liked, setLiked] = useState(item.user_liked || false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await apiClient.get(`/posts/${item.id}/comments`);
        setComments(res.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [item.id]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await apiClient.post(`/posts/${item.id}/comments`, { content: newComment });
      setComments([res.data.comment, ...comments]);
      setNewComment("");
      setIsTyping(false);
      Alert.alert("Success", "Comment added successfully! The creator has been notified.");
    } catch (error) {
      console.error("Error adding comment:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not add comment.");
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await apiClient.delete(`/posts/${item.id}/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
      Alert.alert("Success", "Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not delete comment.");
    }
  };

  const navigateToDetail = () => {
    if (item.is_event) {
      navigation.navigate("EventDetails", { eventId: item.id });
    } else {
      navigation.navigate("PostScreen", { postId: item.id });
    }
  };

  const handleCommentChange = (text) => {
    setNewComment(text);
    setIsTyping(text.trim().length > 0);
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={navigateToDetail}>
      <View style={styles.feedCard}>
        <View
          style={[
            styles.dateBox,
            {
              backgroundColor: theme.mode === "blackAndWhite" ? "#000" : theme.primary, // Reflect theme
            },
          ]}
        >
          <LinearGradient
            colors={
              theme.mode === "blackAndWhite"
                ? ["#000", "#333", "rgba(0, 0, 0, 0)"] // Black fading to transparent
                : [theme.primary, `${theme.primary}CC`, "rgba(0, 0, 0, 0)"] // Primary color fading
            }
            style={styles.dateBoxGradient}
          />
          <Text
            style={[
              styles.dateDayText,
              { color: theme.mode === "blackAndWhite" ? "#fff" : "#fff" }, // White text for both modes
            ]}
          >
            {day}
          </Text>
          <Text
            style={[
              styles.dateMonthText,
              { color: theme.mode === "blackAndWhite" ? "#fff" : "#fff" }, // White text for both modes
            ]}
          >
            {monthName}
          </Text>
        </View>
        <View style={styles.feedAuthorContainer}>
          <Image
            source={{ uri: item.profile_picture || "https://via.placeholder.com/30" }}
            style={styles.feedAuthorPic}
          />
          <Text style={styles.feedAuthorName}>{item.username || item.author || "Unknown"}</Text>
        </View>
        {item.is_event && item.banner_photo && (
          <Image source={{ uri: item.banner_photo }} style={styles.bannerPhoto} />
        )}
        <View style={styles.feedContent}>
          {item.title && <Text style={styles.feedTitle}>{item.title}</Text>}
          <Text style={styles.feedTimeContent}>{timeString}</Text>
          <Text style={styles.feedText}>{item.content || "No content"}</Text>
          {item.location && (
            <Text style={[styles.feedText, { fontFamily: "AirbnbCereal-Medium", fontSize: 14 }]}>
              {item.location}
            </Text>
          )}
          <View style={styles.actionContainer}>
            {isTyping ? (
              <TouchableOpacity
                style={[styles.commentPostButton, theme.mode === "blackAndWhite" && { backgroundColor: "#000" }]}
                onPress={submitComment}
                disabled={!newComment.trim()}
              >
                <Text style={styles.commentPostButtonText}>Post</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => toggleLike(item.id, liked, setLiked, setLikeCount)}
              >
                <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "red" : "#333"} />
                <Text style={styles.likeCount}>{likeCount}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ marginTop: 10 }}>
            <FlatList
              data={comments}
              keyExtractor={(comment, index) => `comment-${comment.id}-${index}`}
              renderItem={({ item: comment }) => (
                <View key={comment.id} style={{ marginBottom: 5 }}>
                  <Text style={{ fontWeight: "bold" }}>{comment.username}:</Text>
                  <Text>{comment.content}</Text>
                  {comment.user_id === currentUserId && (
                    <TouchableOpacity onPress={() => deleteComment(comment.id)}>
                      <Text style={{ color: "red", fontSize: 12 }}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={handleCommentChange}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EventItem = ({ item, navigation, theme }) => {
  const [liked, setLiked] = useState(item.user_liked || false);
  const [likeCount, setLikeCount] = useState(parseInt(item.total_likes) || 0);
  const { day, monthName, timeString } = formatDateString(item.event_date);

  const hasBanner = !!item.banner_photo;
  const isContentLong = (item.content || "").length > 100;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("EventDetails", { eventId: item.id })}
      style={[styles.eventCard, !hasBanner && styles.eventCardNoBanner]}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.dateBox,
          {
            backgroundColor: theme.mode === "blackAndWhite" ? "#000" : theme.primary, // Reflect theme
          },
        ]}
      >
        <LinearGradient
          colors={
            theme.mode === "blackAndWhite"
              ? ["#000", "#333", "rgba(0, 0, 0, 0)"] // Black fading to transparent
              : [theme.primary, `${theme.primary}CC`, "rgba(0, 0, 0, 0)"] // Primary color fading
          }
          style={styles.dateBoxGradient}
        />
        <Text
          style={[
            styles.dateDayText,
            { color: theme.mode === "blackAndWhite" ? "#fff" : "#fff" }, // White text for both modes
          ]}
        >
          {day}
        </Text>
        <Text
          style={[
            styles.dateMonthText,
            { color: theme.mode === "blackAndWhite" ? "#fff" : "#fff" }, // White text for both modes
          ]}
        >
          {monthName}
        </Text>
      </View>
      <View style={styles.upcomingAuthorContainer}>
        <Image
          source={{ uri: item.profile_picture || "https://via.placeholder.com/30" }}
          style={styles.upcomingAuthorPic}
        />
        <Text style={styles.upcomingAuthorName}>{item.username || "Unknown"}</Text>
      </View>
      {hasBanner && (
        <Image source={{ uri: item.banner_photo }} style={styles.eventBannerPhoto} />
      )}
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.feedTimeContent}>{timeString}</Text>
      {isContentLong ? (
        <ScrollView style={styles.eventContentScroll} nestedScrollEnabled={true}>
          <Text style={styles.feedText}>{item.content}</Text>
        </ScrollView>
      ) : (
        <Text style={styles.feedText}>{item.content}</Text>
      )}
      <Text style={styles.eventLocation}>
        {item.location || "No location provided"}
      </Text>
      <TouchableOpacity
        style={styles.likeButton}
        onPress={() => toggleLike(item.id, liked, setLiked, setLikeCount)}
      >
        <Ionicons name={liked ? "heart" : "heart-outline"} size={16} color={liked ? "red" : "#333"} />
        <Text style={styles.likeCount}>{likeCount}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  menuContainer: {
    position: "absolute",
    width: 250,
    height: "200%",
    backgroundColor: "#fff",
    zIndex: 10,
    paddingTop: 90,
    paddingHorizontal: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 0,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileInfo: {
    marginLeft: 10,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333",
    top: 40,
  },
  onlineStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -25,
    paddingTop: 50,
    top: -10,
  },
  onlineIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "green",
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 5,
  },
  onlineToggleButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  onlineToggleText: {
    fontFamily: "AirbnbCereal-Medium",
    color: "#333",
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15 },
  menuText: { marginLeft: 15, fontSize: 16, fontFamily: "AirbnbCereal-Medium" },
  overlay: { flex: 1 },
  homeScreen: { flex: 1, backgroundColor: "#f9f9f9" },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  headerGloss: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header3DEffect: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 10, // Adjust height for the effect
    zIndex: 1,
  },
  menuButton: {
    position: "absolute",
    left: 20,
    top: 50,
    zIndex: 2,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  notificationIcon: {
    position: "absolute",
    right: 20,
    top: 50,
    zIndex: 2,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  locationTitle: { color: "#fff", fontSize: 12, fontFamily: "AirbnbCereal-Medium", marginTop: 5, textAlign: "center" },
  locationText: { color: "#fff", fontSize: 18, fontFamily: "AirbnbCereal-Medium", marginBottom: 10, textAlign: "center" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 25,
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, paddingHorizontal: 8, fontFamily: "AirbnbCereal-Medium" },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    marginLeft: 10,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333"
  },
  feedSectionTitle: {
    fontSize: 18,
    marginTop: 10,
    marginLeft: 10,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333"
  },
  dateBox: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    backgroundColor: "#000", // Default to black for consistency
  },
  dateBoxGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8, // Match the dateBox border radius
  },
  dateDayText: { fontSize: 20, fontWeight: "bold", color: "#fff", lineHeight: 19 },
  dateMonthText: { fontSize: 11, color: "#fff" },
  eventCard: {
    width: width * 0.6,
    height: 280,
    marginRight: 15,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 10,
    position: "relative",
    overflow: "hidden",
  },
  eventCardNoBanner: {
    height: 280,
  },
  eventBannerPhoto: {
    width: "100%",
    height: 60,
    borderRadius: 8,
    marginTop: 7.5,
    marginBottom: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333",
    marginTop: 5,
    marginBottom: 2
  },
  eventContentScroll: {
    maxHeight: 40,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333",
    marginBottom: 5,
  },
  feedCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: "visible",
  },
  fab: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    zIndex: 100,
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    zIndex: 99,
    marginBottom: 0,
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, fontFamily: "AirbnbCereal-Medium", marginTop: 4 },
  postModal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: windowHeight * 0.9,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    zIndex: 101,
  },
  modalCloseButton: { alignSelf: "flex-end" },
  modalTitle: { fontSize: 20, fontFamily: "AirbnbCereal-Medium", marginVertical: 10 },
  modalInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10, height: 100, textAlignVertical: "top", marginBottom: 20 },
  modalSubmitButton: { paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 20 },
  modalSubmitText: { color: "#fff", fontSize: 16, fontFamily: "AirbnbCereal-Medium" },
  filterOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: { width: "90%", maxHeight: "80%", backgroundColor: "#fff", borderRadius: 10, padding: 20 },
  filterTitle: { fontSize: 18, fontFamily: "AirbnbCereal-Medium", marginBottom: 10, textAlign: "center", color: "#333" },
  filterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 8 },
  filterLabel: { fontSize: 16, fontFamily: "AirbnbCereal-Medium", color: "#333" },
  filterOptions: { flexDirection: "row", justifyContent: "space-between", width: "60%" },
  filterOption: { fontSize: 14, color: "#333", paddingHorizontal: 5 },
  filterOptionActive: { fontWeight: "bold" },
  filterButtonsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  filterApplyButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  filterCancelButton: { backgroundColor: "#FF4444", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  filterButtonText: { color: "#fff", fontFamily: "AirbnbCereal-Medium", fontSize: 16 },
  filterText: { color: "#fff", fontFamily: "AirbnbCereal-Medium", fontSize: 16 },
  feedAuthorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 55,
    marginTop: -5,
    marginBottom: 0,
    zIndex: 1,
  },
  feedAuthorPic: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 5,
  },
  feedAuthorName: {
    fontSize: 16,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333",
  },
  upcomingAuthorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 60,
    marginTop: 0,
    marginBottom: 5,
    zIndex: 1,
  },
  upcomingAuthorPic: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 5,
  },
  upcomingAuthorName: {
    fontSize: 16,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333",
  },
  bannerPhoto: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 0,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    position: "absolute",
    bottom: 5,
    right: 10,
  },
  likeCount: { marginLeft: 5, fontSize: 14, color: "#333" },
  searchPopup: {
    position: "absolute",
    top: 100,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 200,
    maxHeight: 300,
  },
  searchPopupHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  searchPopupHandle: { width: 40, height: 5, backgroundColor: "#ccc", borderRadius: 2.5, position: "absolute", top: 5 },
  searchPopupTitle: { fontSize: 16, fontFamily: "AirbnbCereal-Medium", color: "#333" },
  searchResultItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  searchResultText: { fontSize: 14, fontFamily: "AirbnbCereal-Medium", color: "#333" },
  eventButtonContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  eventButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff", // Default background color
  },
  eventButtonActive: {
    backgroundColor: "#333", // Default active background color
  },
  eventButtonText: {
    fontSize: 14,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333", // Default text color
  },
  fabBlueBackground: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0A58CA",
    zIndex: 98,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  feedContent: {
    marginTop: 10,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "AirbnbCereal-Medium",
    marginBottom: 5,
  },
  feedText: {
    fontSize: 14,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333",
  },
  feedTimeContent: {
    fontSize: 12,
    fontWeight: "200",
    color: "#777",
    fontFamily: "AirbnbCereal-Medium",
    marginTop: 2,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  picker: {
    flex: 1,
    height: 150,
  },
  eventLabel: {
    fontSize: 16,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333",
    marginBottom: 5,
  },
  uploadButton: {
    backgroundColor: "#668CFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "AirbnbCereal-Medium",
  },
  bannerPreview: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  postModalContent: {
    paddingBottom: 20,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    width: "50%",
    textAlign: "center",
    alignItems: "center",
  },
  datePickerText: {
    fontSize: 14,
    fontFamily: "AirbnbCereal-Medium",
    color: "#333",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  commentPostButton: {
    backgroundColor: "#0A58CA",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  commentPostButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "AirbnbCereal-Medium",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    fontFamily: "AirbnbCereal-Medium",
  },
  editButton: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF", // Default background color
    padding: 5,
    borderRadius: 5,
    marginBottom: 10,
  },
  editButtonText: {
    color: "#fff", // Default text color
    fontSize: 14,
    fontFamily: "AirbnbCereal-Medium",
  },
  pickerOverlay: {
    position: "absolute",
    top: -20, // Extend the overlay above the pickers
    left: -20, // Extend the overlay to the left
    right: -20, // Extend the overlay to the right
    bottom: -20, // Extend the overlay below the pickers
    backgroundColor: "transparent",
    zIndex: 1,
  },
  spacingAbovePicker: {
    marginBottom: 0,
    marginTop: 50,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 5,
    marginBottom: 20, // Space below each picker
    paddingBottom: 20, // Add 10pt extra padding to lower the bottom of the border
  },
  map: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
});
export default HomePage;