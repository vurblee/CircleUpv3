import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { formatDateString } from "../utils/dateUtils";
import { useTheme } from "../../src/providers/ThemeContext";
<<<<<<< HEAD
import { LinearGradient } from "expo-linear-gradient";
import HapticButton from "../components/hapticbutton";  // HapticButton imported
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

const { width, height: windowHeight } = Dimensions.get("window");

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
  const [postModalAnim] = useState(new Animated.Value(windowHeight));
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [isEvent, setIsEvent] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
<<<<<<< HEAD
  const [editingPostId, setEditingPostId] = useState(null);
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

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

  const [currentUserId, setCurrentUserId] = useState(null);
  const popupAnim = useRef(new Animated.Value(300)).current;

  const [filterVisible, setFilterVisible] = useState(false);
  const [filterFriendsOnly, setFilterFriendsOnly] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterPostType, setFilterPostType] = useState("all");

<<<<<<< HEAD
  const [fabScale] = useState(new Animated.Value(1));

=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const loadCurrentUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      setCurrentUserId(storedUserId);
    } catch (error) {
      console.error("Error loading current user id:", error);
    }
  };

  const fetchFriendsList = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      const response = await axios.get("http://192.168.1.231:5000/api/friends", {
=======
      const response = await axios.get("http://10.0.2.2:5000/api/friends", {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendsList(response.data);
    } catch (error) {
      console.error("Error fetching friends list:", error);
    }
  };

  useEffect(() => {
    if (filterVisible && friendsList.length === 0) {
      fetchFriendsList();
    }
  }, [filterVisible]);

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
      const token = await AsyncStorage.getItem("userToken");
      const [usersRes, postsRes] = await Promise.all([
<<<<<<< HEAD
        axios.get("http://192.168.1.231:5000/api/users/search", {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://192.168.1.231:5000/api/posts/search", {
=======
        axios.get("http://10.0.2.2:5000/api/users/search", {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://10.0.2.2:5000/api/posts/search", {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const userResults = usersRes.data.map((u) => ({ ...u, type: "user" }));
      const postResults = postsRes.data.map((p) => ({ ...p, type: "post" }));
      setSearchResults([...userResults, ...postResults]);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      let userId = await AsyncStorage.getItem("userId");
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      if (!userId) {
        const decoded = jwtDecode(token);
        userId = decoded.userId;
        await AsyncStorage.setItem("userId", userId);
      }
<<<<<<< HEAD
      const response = await axios.get("http://192.168.1.231:5000/api/posts/upcoming-events", {
=======
      const response = await axios.get("http://10.0.2.2:5000/api/posts/upcoming-events", {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingEvents(response.data);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchFeedPosts = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      const response = await axios.get("http://192.168.1.231:5000/api/posts", {
=======
      const response = await axios.get("http://10.0.2.2:5000/api/posts", {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedPosts(response.data);
    } catch (error) {
      console.error("Error fetching feed posts:", error);
    } finally {
      setLoadingFeed(false);
    }
  };

  const applyFeedFilters = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const queryParams = new URLSearchParams();
      if (filterFriendsOnly) queryParams.append("friendsOnly", "true");
      if (selectedFriendIds.length > 0) queryParams.append("friendIds", selectedFriendIds.join(","));
      if (filterStartDate) queryParams.append("startDate", filterStartDate);
      if (filterEndDate) queryParams.append("endDate", filterEndDate);
      if (filterPostType !== "all") queryParams.append("eventType", filterPostType);
<<<<<<< HEAD
      const url = `http://192.168.1.231:5000/api/posts/filter?${queryParams.toString()}`;
=======
      const url = `http://10.0.2.2:5000/api/posts/filter?${queryParams.toString()}`;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedPosts(response.data);
      setFilterVisible(false);
    } catch (error) {
      console.error("Error applying feed filters:", error);
      Alert.alert("Error", "Could not apply filters.");
    }
  };

  const fetchConversations = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      const response = await axios.get("http://192.168.1.231:5000/api/conversations", {
=======
      const response = await axios.get("http://10.0.2.2:5000/api/conversations", {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data);
      setDeletedConversations([]);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      Alert.alert("Error", "Unable to fetch conversations.");
    }
  };

  useEffect(() => {
    loadCurrentUserId();
    fetchUpcomingEvents();
    fetchFeedPosts();
    fetchConversations();
  }, []);

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
    Animated.timing(postModalAnim, { toValue: windowHeight * 0.2, duration: 300, useNativeDriver: false }).start();
  };

  const closePostModal = () => {
    Animated.timing(postModalAnim, { toValue: windowHeight, duration: 300, useNativeDriver: false }).start(() => {
      setShowPostModal(false);
      setPostTitle("");
      setPostContent("");
      setIsEvent(false);
      setEventDate("");
      setLatitude("");
      setLongitude("");
<<<<<<< HEAD
      setEditingPostId(null); // new
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    });
  };

  const handleSubmitPost = async () => {
    if (!postTitle || !postContent) {
      Alert.alert("Error", "Title and content are required.");
      return;
    }
    if (isEvent && (!eventDate || !latitude || !longitude)) {
      Alert.alert("Error", "Event date and location (latitude, longitude) are required for events.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
      const payload = {
        title: postTitle,
        content: postContent,
        is_event: isEvent,
        event_date: isEvent ? eventDate : null,
        latitude: isEvent ? parseFloat(latitude) : null,
        longitude: isEvent ? parseFloat(longitude) : null,
        image: null,
      };
<<<<<<< HEAD
      await axios.post("http://192.168.1.231:5000/api/posts", payload, {
=======
      await axios.post("http://10.0.2.2:5000/api/posts", payload, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFeedPosts();
      fetchUpcomingEvents();
      closePostModal();
      Alert.alert("Success", "Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not create post.");
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
            const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
            await axios.delete(`http://192.168.1.231:5000/api/posts/${postId}`, {
=======
            await axios.delete(`http://10.0.2.2:5000/api/posts/${postId}`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              headers: { Authorization: `Bearer ${token}` },
            });
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
<<<<<<< HEAD
    setEditingPostId(item.id); // new
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    setPostTitle(item.title);
    setPostContent(item.content);
    setIsEvent(item.is_event);
    setEventDate(item.event_date || "");
<<<<<<< HEAD
=======
    setLatitude(item.latitude ? item.latitude.toString() : "");
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    setLongitude(item.longitude ? item.longitude.toString() : "");
    setShowPostModal(true);
    Animated.timing(postModalAnim, { toValue: windowHeight * 0.2, duration: 300, useNativeDriver: false }).start();
  };

  const animatePopupUp = () => {
    Animated.timing(popupAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const animatePopupDown = () => {
<<<<<<< HEAD
    Animated.timing(popupAnim, { toValue: -300, duration: 300, useNativeDriver: true }).start();
=======
    Animated.timing(popupAnim, { toValue: 300, duration: 300, useNativeDriver: true }).start();
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  };

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
              <View style={styles.profilePicContainer}>
                <Image source={{ uri: "https://via.placeholder.com/70" }} style={styles.profilePic} />
                <View style={styles.onlineIndicator} />
              </View>
<<<<<<< HEAD
              <HapticButton style={styles.onlineToggleButton} onPress={() => { /* add your online toggle logic */ }}>
                <Text style={styles.onlineToggleText}>Online</Text>
              </HapticButton>
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
=======
              <TouchableOpacity style={styles.onlineToggleButton}>
                <Text style={styles.onlineToggleText}>Online</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Profile")}>
              <Ionicons name="person-outline" size={22} color="#000" />
              <Text style={styles.menuText}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Map")}>
              <Ionicons name="map-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("FriendsScreen")}>
              <Ionicons name="people-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Messages")}>
              <Ionicons name="chatbubble-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Events")}>
              <Ionicons name="calendar-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("SupportFAQ")}>
              <Ionicons name="help-circle-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Support & FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("SignIn")}>
              <Ionicons name="log-out-outline" size={22} color="#000" />
              <Text style={styles.menuText}>Sign Out</Text>
            </TouchableOpacity>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          </Animated.View>

          <Pressable style={styles.overlay} onPress={menuVisible ? toggleMenu : undefined}>
            <Animated.View style={[styles.homeScreen, { transform: [{ scale: scaleAnim }], borderRadius: borderRadiusAnim }]}>
<<<<<<< HEAD
              <LinearGradient
                colors={["#007AFF", "#005BB5"]} // Fade from blue to a darker blue
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.headerGradient} // Use the new gradient style
              >
                {/* header content goes here */}
                <HapticButton style={styles.menuButton} onPress={toggleMenu}>
                  <Ionicons name="menu" size={28} color="#fff" />
                </HapticButton>
                <HapticButton
=======
              <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
                  <Ionicons name="menu" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                  style={styles.notificationIcon}
                  onPress={() => navigation.navigate("NotificationsScreen")}
                >
                  <Ionicons name="notifications-outline" size={24} color="#fff" />
<<<<<<< HEAD
                </HapticButton>
                <HapticButton onPress={() => console.log("Location clicked!")}>
                  <Text style={styles.locationTitle}>Current Location</Text>
                  <Text style={styles.locationText}>New York, USA</Text>
                </HapticButton>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
                  <View
                    style={[
                      styles.searchContainer,
                      { flex: 1, backgroundColor: "transparent" } // override any blue background
                    ]}
                  >
                    <Ionicons
                      name="search-outline"
                      size={18}
                      color="#aaa"
                      style={{ marginLeft: 10 }}
                    />
                    <Text
                      style={{
                        color: "#aaa",
                        marginHorizontal: 5,
                        fontSize: 20
                      }}
                    >
                      |
                    </Text>
                    <TextInput
                      style={[
                        styles.searchInput,
                        { fontSize: 20 }
                      ]}
                      placeholder="Search..."
                      placeholderTextColor="#aaa"
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
                      { borderColor: "#ADD8E6", marginLeft: 10, transform: [{ translateY: -15 }] }  // raises the button further
                    ]}
                    onPress={() => setFilterVisible(true)}
                  >
                    <Text style={styles.filterText}>Filters</Text>
                    <Ionicons name="options-outline" size={16} color="#fff" style={{ marginLeft: 4 }} />
                  </HapticButton>
                </View>
                {/* Glossy overlay */}
                <LinearGradient
                  colors={["transparent", "rgba(255, 255, 255, 0.37)"]}
                  style={styles.headerGloss}
                  pointerEvents="none"
                />
              </LinearGradient>

              <Modal transparent visible={filterVisible} animationType="slide">
                <View style={styles.filterOverlay}>
                  <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill}>
                    <LinearGradient
                      colors={["rgba(0,122,255,0.3)", "rgba(0,85,181,0.3)"]} // semi-transparent blue gradient
                      style={StyleSheet.absoluteFill}
                    />
                  </BlurView>
=======
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log("Location clicked!")}>
                  <Text style={styles.locationTitle}>Current Location</Text>
                  <Text style={styles.locationText}>New York, USA</Text>
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                  <Ionicons name="search-outline" size={18} color="#aaa" style={{ marginLeft: 10 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor="#aaa"
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                </View>
                <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.primary }]} onPress={() => setFilterVisible(true)}>
                  <Text style={styles.filterText}>Filters</Text>
                  <Ionicons name="options-outline" size={16} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>

              <Modal transparent visible={filterVisible} animationType="slide">
                <View style={styles.filterOverlay}>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                  <View style={styles.filterContainer}>
                    <ScrollView>
                      <Text style={styles.filterTitle}>Filter Feed</Text>
                      <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>Friends Only</Text>
                        <TouchableOpacity onPress={() => setFilterFriendsOnly(!filterFriendsOnly)}>
                          <Ionicons
                            name={filterFriendsOnly ? "checkbox" : "square-outline"}
                            size={24}
                            color={theme.primary}
                          />
                        </TouchableOpacity>
                      </View>
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
                                  color={theme.primary}
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                      <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>Start Date</Text>
                        <TextInput
                          style={styles.filterInput}
                          placeholder="YYYY-MM-DD"
                          value={filterStartDate}
                          onChangeText={setFilterStartDate}
                        />
                      </View>
                      <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>End Date</Text>
                        <TextInput
                          style={styles.filterInput}
                          placeholder="YYYY-MM-DD"
                          value={filterEndDate}
                          onChangeText={setFilterEndDate}
                        />
                      </View>
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
<<<<<<< HEAD
                      <HapticButton style={[styles.filterApplyButton, { backgroundColor: theme.primary }]} onPress={applyFeedFilters}>
                        <Text style={styles.filterButtonText}>Apply Filters</Text>
                      </HapticButton>
                      <HapticButton style={styles.filterCancelButton} onPress={() => setFilterVisible(false)}>
                        <Text style={styles.filterButtonText}>Cancel</Text>
                      </HapticButton>
=======
                      <TouchableOpacity style={[styles.filterApplyButton, { backgroundColor: theme.primary }]} onPress={applyFeedFilters}>
                        <Text style={styles.filterButtonText}>Apply Filters</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.filterCancelButton} onPress={() => setFilterVisible(false)}>
                        <Text style={styles.filterButtonText}>Cancel</Text>
                      </TouchableOpacity>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <EventItem
                      item={item}
                      currentUserId={currentUserId}
                      onDelete={handleDeletePost}
                      onEdit={handleEditPost}
                      navigation={navigation}
                      theme={theme}
                    />
                  )}
                  style={{ marginVertical: 10 }}
<<<<<<< HEAD
                  contentContainerStyle={{ paddingHorizontal: 12 }}  // aligns the first event with feed posts
                />
                <View style={styles.feedWrapper}>
                  <Text style={styles.feedSectionTitle}>Feed</Text>
                  <FlatList
                    data={feedPosts}
                    nestedScrollEnabled={true}
                    keyExtractor={(item) => item.id.toString()}
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
                    contentContainerStyle={{ paddingTop: 10 }} // Changed from 40 to 10 to match Upcoming Events gap
                  />
                </View>
              </ScrollView>

              {/* Insert the blue circle view below the menu and before the FAB */}
              <View style={styles.fabBlueBackground}>
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,1)"]} // Use full white for testing
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: 56,
                    height: 40, // Increase height for visibility
                    borderBottomLeftRadius: 28,
                    borderBottomRightRadius: 28,
                    zIndex: 99, // Ensure it overlays the blue container
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </View>

              <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
                <LinearGradient
                  colors={["#0A58CA", "#4A90E2"]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{ 
                    position: "absolute",
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    elevation: 10, // Android shadow
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
                  <Ionicons name="compass-outline" size={24} color={theme.primary} />
                  <Text style={[styles.navText, { color: theme.primary }]}>Explore</Text>
                </HapticButton>
                <HapticButton style={styles.navItem} onPress={() => navigation.navigate("Events")}>
                  <Ionicons name="calendar" size={24} color={theme.primary} />
                  <Text style={[styles.navText, { color: theme.primary }]}>Events</Text>
                </HapticButton>
                <HapticButton style={styles.navItem} onPress={() => navigation.navigate("Messages")}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.primary} />
                  <Text style={[styles.navText, { color: theme.primary }]}>Messages</Text>
                </HapticButton>
                <HapticButton style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
                  <Ionicons name="person-circle-outline" size={24} color={theme.primary} />
                  <Text style={[styles.navText, { color: theme.primary }]}>Profile</Text>
                </HapticButton>
=======
                />
                <Text style={styles.sectionTitle}>Feed</Text>
                <FlatList
                  data={feedPosts}
                  nestedScrollEnabled={true}
                  keyExtractor={(item) => item.id.toString()}
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
                />
              </ScrollView>

              <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={openPostModal}>
                <Ionicons name="add" size={28} color="#fff" />
              </TouchableOpacity>

              <View style={styles.navBar}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Explore")}>
                  <Ionicons name="search-outline" size={24} color={theme.primary} />
                  <Text style={[styles.navText, { color: theme.primary }]}>Explore</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Events")}>
                  <Ionicons name="calendar-outline" size={24} color={theme.primary} />
                  <Text style={[styles.navText, { color: theme.primary }]}>Events</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Messages")}>
                  <Ionicons name="chatbubble-outline" size={24} color={theme.primary} />
                  <Text style={[styles.navText, { color: theme.primary }]}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
                  <Ionicons name="person-outline" size={24} color={theme.primary} />
                  <Text style={[styles.navText, { color: theme.primary }]}>Profile</Text>
                </TouchableOpacity>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              </View>
            </Animated.View>
          </Pressable>

<<<<<<< HEAD
          {searchQuery.trim().length > 0 && (
            <Animated.View style={[styles.searchPopup, { transform: [{ translateY: popupAnim }] }]}>
              <View style={styles.searchPopupHeader}>
                <View style={styles.searchPopupHandle} />
                <Text style={styles.searchPopupTitle}>Search Results</Text>
                <HapticButton
                  style={{ position: "absolute", top: 5, right: 10 }}
                  onPress={() => {
=======
          <Animated.View style={[styles.searchPopup, { transform: [{ translateY: popupAnim }] }]}>
            <View style={styles.searchPopupHeader}>
              <View style={styles.searchPopupHandle} />
              <Text style={styles.searchPopupTitle}>Search Results</Text>
              {searchLoading && <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: 8 }} />}
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => {
                    if (item.type === "user") {
                      navigation.navigate("Profile", { userId: item.id });
                    } else {
                      navigation.navigate("PostScreen", { postId: item.id });
                    }
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                    setSearchQuery("");
                    setSearchResults([]);
                    animatePopupDown();
                  }}
                >
<<<<<<< HEAD
                  <Ionicons name="close" size={24} color="#333" />
                </HapticButton>
                {searchLoading && <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: 8 }} />}
              </View>
              <FlatList
                data={searchResults}
                keyExtractor={(item, idx) => idx.toString()}
                keyboardShouldPersistTaps="always"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => {
                      if (item.type === "user") {
                        navigation.navigate("Profile", { userId: item.id });
                      } else {
                        navigation.navigate("PostScreen", { postId: item.id });
                      }
                      setSearchQuery("");
                      setSearchResults([]);
                      animatePopupDown();
                    }}
                  >
                    <Text style={styles.searchResultText}>
                      {item.type === "user" ? `User: ${item.name}` : `Post: ${item.title}`}
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
              {/* Full screen blur behind the post modal */}
              <BlurView
                intensity={50}
                tint="light"
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
              />
              <Animated.View style={[styles.postModal, { top: postModalAnim }]}>
                <HapticButton onPress={closePostModal} style={styles.modalCloseButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </HapticButton>
=======
                  <Text style={styles.searchResultText}>
                    {item.type === "user" ? `User: ${item.name}` : `Post: ${item.title}`}
                  </Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 300 }}
              ListEmptyComponent={
                !searchLoading && searchQuery.trim().length > 0 ? (
                  <Text style={{ textAlign: "center", color: "#999", marginVertical: 10 }}>No results found</Text>
                ) : null
              }
            />
          </Animated.View>

          {showPostModal && (
            <>
              <BlurView intensity={50} tint="light" style={{ position: "absolute", top: 0, left: 0, right: 0, height: windowHeight * 0.2, zIndex: 100 }} />
              <Animated.View style={[styles.postModal, { top: postModalAnim }]}>
                <TouchableOpacity onPress={closePostModal} style={styles.modalCloseButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                <Text style={styles.modalTitle}>Create Post</Text>
                <TextInput
                  style={[styles.modalInput, { marginBottom: 10 }]}
                  placeholder="Title"
                  value={postTitle}
                  onChangeText={setPostTitle}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="What's on your mind?"
                  multiline
                  value={postContent}
                  onChangeText={setPostContent}
                />
                <View style={styles.eventButtonContainer}>
<<<<<<< HEAD
                  <HapticButton
=======
                  <TouchableOpacity
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                    style={[styles.eventButton, !isEvent && styles.eventButtonActive]}
                    onPress={() => setIsEvent(false)}
                  >
                    <Text style={[styles.eventButtonText, !isEvent && { color: "#fff" }]}>Post</Text>
<<<<<<< HEAD
                  </HapticButton>
                  <HapticButton
=======
                  </TouchableOpacity>
                  <TouchableOpacity
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                    style={[styles.eventButton, isEvent && styles.eventButtonActive]}
                    onPress={() => setIsEvent(true)}
                  >
                    <Text style={[styles.eventButtonText, isEvent && { color: "#fff" }]}>Event</Text>
<<<<<<< HEAD
                  </HapticButton>
=======
                  </TouchableOpacity>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                </View>
                {isEvent && (
                  <>
                    <TextInput
                      style={styles.eventDateInput}
                      placeholder="YYYY-MM-DD HH:MM"
                      value={eventDate}
                      onChangeText={setEventDate}
                    />
                    <TextInput
                      style={styles.eventDateInput}
                      placeholder="Latitude"
                      value={latitude}
                      onChangeText={setLatitude}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.eventDateInput}
                      placeholder="Longitude"
                      value={longitude}
                      onChangeText={setLongitude}
                      keyboardType="numeric"
                    />
                  </>
                )}
<<<<<<< HEAD
                {/* Post Button */}
                <HapticButton
                  style={[styles.modalSubmitButton, { backgroundColor: theme.primary }]}
                  onPress={handleSubmitPost}
                >
                  <Text style={styles.modalSubmitText}>Post</Text>
                </HapticButton>
                {/* Delete Button appears only during edit */}
                {editingPostId && (
                  <HapticButton
                    style={[styles.modalSubmitButton, { backgroundColor: "#FF4444", marginTop: 10 }]}
                    onPress={() => {
                      Alert.alert("Confirm Delete", "Are you sure you want to delete this post?", [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              const token = await AsyncStorage.getItem("userToken");
                              await axios.delete(`http://192.168.1.231:5000/api/posts/${editingPostId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              fetchFeedPosts();
                              fetchUpcomingEvents();
                              closePostModal();
                              Alert.alert("Success", "Post deleted successfully!");
                            } catch (error) {
                              console.error("Error deleting post:", error.response?.data || error.message);
                              Alert.alert("Error", error.response?.data?.error || "Could not delete post.");
                            }
                          },
                        },
                      ]);
                    }}
                  >
                    <Text style={styles.modalSubmitText}>Delete Post</Text>
                  </HapticButton>
                )}
=======
                <TouchableOpacity style={[styles.modalSubmitButton, { backgroundColor: theme.primary }]} onPress={handleSubmitPost}>
                  <Text style={styles.modalSubmitText}>Post</Text>
                </TouchableOpacity>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
        const response = await axios.get(`http://192.168.1.231:5000/api/posts/${item.id}/likes`, {
=======
        const response = await axios.get(`http://10.0.2.2:5000/api/posts/${item.id}/likes`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikeCount(response.data.like_count);
        const currentUser = await AsyncStorage.getItem("userId");
        setLiked(response.data.user_ids?.includes(currentUser));
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
        const response = await axios.get(`http://192.168.1.231:5000/api/posts/${item.id}/comments`, {
=======
        const response = await axios.get(`http://10.0.2.2:5000/api/posts/${item.id}/comments`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments for post:", item.id, error);
      }
    };

    fetchLikes();
    fetchComments();
  }, [item.id]);

  const handleLike = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Please log in to like/unlike posts.");
        return;
      }
      if (liked) {
<<<<<<< HEAD
        await axios.delete(`http://192.168.1.231:5000/api/posts/${item.id}/like`, {
=======
        await axios.delete(`http://10.0.2.2:5000/api/posts/${item.id}/like`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          headers: { Authorization: `Bearer ${token}` },
        });
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
<<<<<<< HEAD
        await axios.post(`http://192.168.1.231:5000/api/posts/${item.id}/like`, {}, {
=======
        await axios.post(`http://10.0.2.2:5000/api/posts/${item.id}/like`, {}, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          headers: { Authorization: `Bearer ${token}` },
        });
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Could not update like status.");
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
        Alert.alert("Error", "Please log in to comment.");
        return;
      }
      const response = await axios.post(
<<<<<<< HEAD
        `http://192.168.1.231:5000/api/posts/${item.id}/comments`,
=======
        `http://10.0.2.2:5000/api/posts/${item.id}/comments`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([response.data.comment, ...comments]);
      setNewComment("");
      Alert.alert("Success", "Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not add comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
            await axios.delete(`http://192.168.1.231:5000/api/posts/${item.id}/comments/${commentId}`, {
=======
            await axios.delete(`http://10.0.2.2:5000/api/posts/${item.id}/comments/${commentId}`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              headers: { Authorization: `Bearer ${token}` },
            });
            setComments(comments.filter((comment) => comment.id !== commentId));
            Alert.alert("Success", "Comment deleted successfully!");
          } catch (error) {
            console.error("Error deleting comment:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "Could not delete comment.");
          }
        },
      },
    ]);
  };

  const displayedComments = comments.slice(0, 3);
  const hasMoreComments = comments.length >= 4;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("PostScreen", { postId: item.id })}>
      <View style={styles.feedCard}>
<<<<<<< HEAD
=======
        {currentUserId === item.user_id && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.iconButton, styles.deleteIconButton]}
              onPressIn={(e) => e.stopPropagation()}
              onPress={() => onDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.editIconButton, { backgroundColor: theme.primary }]}
              onPressIn={(e) => e.stopPropagation()}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="pencil-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        <View style={[styles.dateBox, { backgroundColor: theme.primary }]}>
          <Text style={styles.dateDayText}>{day}</Text>
          <Text style={styles.dateMonthText}>{monthName}</Text>
        </View>
<<<<<<< HEAD
        {/* Move author info below the date to the right */}
        <View style={styles.authorContainerCustom}>
=======
        <View style={[styles.authorContainer, { position: "absolute", top: 10, left: 70 }]}>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          <Image
            source={{ uri: item.profile_picture || "https://via.placeholder.com/30" }}
            style={styles.authorPic}
          />
          <Text style={styles.authorName}>{item.username || "Unknown"}</Text>
        </View>
<<<<<<< HEAD
        <View style={styles.feedContent}>
          {item.title && <Text style={styles.feedTitle}>{item.title}</Text>}
          <Text style={styles.feedTimeContent}>{timeString}</Text>
          <Text style={styles.feedText}>{item.content || "No content"}</Text>
        </View>
=======
        {item.title && <Text style={styles.feedTitle}>{item.title}</Text>}
        <Text style={styles.feedTimeContent}>{timeString}</Text>
        <Text style={styles.feedText}>{item.content || "No content"}</Text>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "red" : "#333"} />
          <Text style={styles.likeCount}>{likeCount}</Text>
        </TouchableOpacity>
        <View style={styles.commentsContainer}>
          {displayedComments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={styles.commentUser}>{comment.username}</Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</Text>
              {currentUserId === comment.user_id && (
                <TouchableOpacity
                  style={styles.deleteCommentButton}
                  onPress={() => handleDeleteComment(comment.id)}
                >
<<<<<<< HEAD
                  <Ionicons name="trash-outline" size={16} color="#FF4444" />
=======
                  <Ionicons name="trash" size={16} color="#fff" />
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                </TouchableOpacity>
              )}
            </View>
          ))}
          {hasMoreComments && (
            <TouchableOpacity onPress={() => navigation.navigate("PostScreen", { postId: item.id })}>
              <Text style={[styles.viewCommentsText, { color: theme.primary }]}>View All Comments</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
<<<<<<< HEAD
          {newComment.trim() !== "" && (
            <TouchableOpacity
              style={[
                styles.commentSubmitButton,
                commentLoading && styles.disabledButton,
                { backgroundColor: theme.primary }
              ]}
              onPress={handleAddComment}
              disabled={commentLoading}
            >
              <Text style={styles.commentSubmitText}>
                {commentLoading ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {currentUserId === item.user_id && (
          <View style={styles.actionButtons}>
            <HapticButton
              style={styles.iconButton}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="pencil-outline" size={20} color="#007AFF" />
            </HapticButton>
          </View>
        )}
=======
          <TouchableOpacity
            style={[styles.commentSubmitButton, commentLoading && styles.disabledButton, { backgroundColor: theme.primary }]}
            onPress={handleAddComment}
            disabled={commentLoading}
          >
            <Text style={styles.commentSubmitText}>{commentLoading ? "Posting..." : "Post"}</Text>
          </TouchableOpacity>
        </View>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      </View>
    </TouchableOpacity>
  );
};

const EventItem = ({ item, currentUserId, onDelete, onEdit, navigation, theme }) => {
  const [likedEvent, setLikedEvent] = useState(false);
  const [likeCountEvent, setLikeCountEvent] = useState(0);
  const [commentsEvent, setCommentsEvent] = useState([]);
  const [newCommentEvent, setNewCommentEvent] = useState("");
  const [commentLoadingEvent, setCommentLoadingEvent] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
        const response = await axios.get(`http://192.168.1.231:5000/api/posts/${item.id}/likes`, {
=======
        const response = await axios.get(`http://10.0.2.2:5000/api/posts/${item.id}/likes`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikeCountEvent(response.data.like_count);
        const currentUser = await AsyncStorage.getItem("userId");
        setLikedEvent(response.data.user_ids?.includes(currentUser));
      } catch (error) {
        console.error("Error fetching likes for event:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
        const response = await axios.get(`http://192.168.1.231:5000/api/posts/${item.id}/comments`, {
=======
        const response = await axios.get(`http://10.0.2.2:5000/api/posts/${item.id}/comments`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          headers: { Authorization: `Bearer ${token}` },
        });
        setCommentsEvent(response.data);
      } catch (error) {
        console.error("Error fetching comments for event:", item.id, error);
      }
    };

    fetchLikes();
    fetchComments();
  }, [item.id]);

  const handleLikeEvent = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Please log in to like/unlike events.");
        return;
      }
      if (likedEvent) {
<<<<<<< HEAD
        await axios.delete(`http://192.168.1.231:5000/api/posts/${item.id}/like`, {
=======
        await axios.delete(`http://10.0.2.2:5000/api/posts/${item.id}/like`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedEvent(false);
        setLikeCountEvent((prev) => prev - 1);
      } else {
<<<<<<< HEAD
        await axios.post(`http://192.168.1.231:5000/api/posts/${item.id}/like`, {}, {
=======
        await axios.post(`http://10.0.2.2:5000/api/posts/${item.id}/like`, {}, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedEvent(true);
        setLikeCountEvent((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like for event:", error);
      Alert.alert("Error", "Could not update like status for event.");
    }
  };

  const handleAddCommentEvent = async () => {
    if (!newCommentEvent.trim()) {
      Alert.alert("Error", "Comment cannot be empty.");
      return;
    }
    setCommentLoadingEvent(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Please log in to comment.");
        return;
      }
      const response = await axios.post(
<<<<<<< HEAD
        `http://192.168.1.231:5000/api/posts/${item.id}/comments`,
=======
        `http://10.0.2.2:5000/api/posts/${item.id}/comments`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        { content: newCommentEvent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentsEvent([response.data.comment, ...commentsEvent]);
      setNewCommentEvent("");
      Alert.alert("Success", "Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment to event:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Could not add comment.");
    } finally {
      setCommentLoadingEvent(false);
    }
  };

  const handleDeleteCommentEvent = async (commentId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
            await axios.delete(`http://192.168.1.231:5000/api/posts/${item.id}/comments/${commentId}`, {
=======
            await axios.delete(`http://10.0.2.2:5000/api/posts/${item.id}/comments/${commentId}`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              headers: { Authorization: `Bearer ${token}` },
            });
            setCommentsEvent(commentsEvent.filter((comment) => comment.id !== commentId));
            Alert.alert("Success", "Comment deleted successfully!");
          } catch (error) {
            console.error("Error deleting comment from event:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "Could not delete comment.");
          }
        },
      },
    ]);
  };

  const displayedCommentsEvent = commentsEvent.slice(0, 3);
  const hasMoreCommentsEvent = commentsEvent.length >= 4;

  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate("EventDetails", { eventId: item.id, event: item })}
      activeOpacity={0.8}
    >
<<<<<<< HEAD
=======
      {currentUserId === item.user_id && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.iconButton, styles.deleteIconButton]}
            onPressIn={(e) => e.stopPropagation()}
            onPress={() => onDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.editIconButton, { backgroundColor: theme.primary }]}
            onPressIn={(e) => e.stopPropagation()}
            onPress={() => onEdit(item)}
          >
            <Ionicons name="pencil-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      <View style={[styles.dateBox, { backgroundColor: theme.primary }]}>
        <Text style={styles.dateDayText}>{formatDateString(item.event_date).day}</Text>
        <Text style={styles.dateMonthText}>{formatDateString(item.event_date).monthName}</Text>
      </View>
      <View style={[styles.authorContainer, { position: "absolute", top: 10, left: 70 }]}>
        <Image
          source={{ uri: item.profile_picture || "https://via.placeholder.com/30" }}
          style={styles.authorPic}
        />
        <Text style={styles.authorName}>{item.username || "Unknown"}</Text>
      </View>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.eventImage} />
      ) : (
        <View style={styles.noImagePlaceholder}>
          <Text style={{ color: "#999" }}>No Image</Text>
        </View>
      )}
      <Text style={styles.eventTitle}>{item.title}</Text>
      {item.latitude && item.longitude && (
        <Text style={styles.eventLocation}>Location: Lat {item.latitude}, Lng {item.longitude}</Text>
      )}
      <TouchableOpacity style={styles.likeButton} onPress={handleLikeEvent}>
        <Ionicons name={likedEvent ? "heart" : "heart-outline"} size={20} color={likedEvent ? "red" : "#333"} />
        <Text style={styles.likeCount}>{likeCountEvent}</Text>
      </TouchableOpacity>
      <View style={styles.commentsContainer}>
        {displayedCommentsEvent.map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <Text style={styles.commentUser}>{comment.username}</Text>
            <Text style={styles.commentContent}>{comment.content}</Text>
            <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</Text>
            {currentUserId === comment.user_id && (
              <TouchableOpacity style={styles.deleteCommentButton} onPress={() => handleDeleteCommentEvent(comment.id)}>
<<<<<<< HEAD
                <Ionicons name="trash-outline" size={16} color="#FF4444" />
=======
                <Ionicons name="trash" size={16} color="#fff" />
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              </TouchableOpacity>
            )}
          </View>
        ))}
        {hasMoreCommentsEvent && (
          <TouchableOpacity onPress={() => navigation.navigate("EventDetails", { eventId: item.id, event: item })}>
            <Text style={[styles.viewCommentsText, { color: theme.primary }]}>View All Comments</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newCommentEvent}
          onChangeText={setNewCommentEvent}
          multiline
        />
<<<<<<< HEAD
        {newCommentEvent.trim() !== "" && (
          <TouchableOpacity
            style={[
              styles.commentSubmitButton,
              commentLoadingEvent && styles.disabledButton,
              { backgroundColor: theme.primary }
            ]}
            onPress={handleAddCommentEvent}
            disabled={commentLoadingEvent}
          >
            <Text style={styles.commentSubmitText}>
              {commentLoadingEvent ? "Posting..." : "Post"}
            </Text>
          </TouchableOpacity>
        )}
=======
        <TouchableOpacity
          style={[styles.commentSubmitButton, commentLoadingEvent && styles.disabledButton, { backgroundColor: theme.primary }]}
          onPress={handleAddCommentEvent}
          disabled={commentLoadingEvent}
        >
          <Text style={styles.commentSubmitText}>{commentLoadingEvent ? "Posting..." : "Post"}</Text>
        </TouchableOpacity>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  menuContainer: {
    position: "absolute",
    width: 250,
    height: "100%",
    backgroundColor: "#fff",
    zIndex: 10,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileHeader: { alignItems: "center", marginBottom: 20 },
  profilePicContainer: { position: "relative" },
  profilePic: { width: 70, height: 70, borderRadius: 35 },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "green",
    borderWidth: 2,
    borderColor: "#fff",
  },
  onlineToggleButton: {
    marginTop: 5,
    backgroundColor: "#f0f0f0",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  onlineToggleText: { fontFamily: "AirbnbCereal-Medium", color: "#333" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15 },
  menuText: { marginLeft: 15, fontSize: 16, fontFamily: "AirbnbCereal-Medium" },
  overlay: { flex: 1 },
  homeScreen: { flex: 1, backgroundColor: "#f9f9f9" },
<<<<<<< HEAD
  headerGradient: {
=======
  header: {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
<<<<<<< HEAD
    overflow: "hidden", // ensures the gradient is clipped by the rounded corners
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
    height: 5,  // Limits the gloss to the bottom
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  locationTitle: { color: "#fff", fontSize: 12, fontFamily: "AirbnbCereal-Medium", marginTop: 5, textAlign: "center" },
  locationText: { color: "#fff", fontSize: 18, fontFamily: "AirbnbCereal-Medium", marginBottom: 10, textAlign: "center" },
  /* --- Updated Search Container --- */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent", // make background transparent
    borderRadius: 25,
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    // Optionally, add a subtle border if needed:
    // borderWidth: 1,
    // borderColor: "rgba(255,255,255,0.3)",
  },
  searchInput: { flex: 1, paddingHorizontal: 8, fontFamily: "AirbnbCereal-Medium", color: "#fff" },
  /* --- Updated Filter Button --- */
=======
  },
  menuButton: { position: "absolute", left: 20, top: 50, zIndex: 2 },
  notificationIcon: { position: "absolute", right: 20, top: 50, zIndex: 2 },
  locationTitle: { color: "#fff", fontSize: 12, fontFamily: "AirbnbCereal-Medium", marginTop: 5, textAlign: "center" },
  locationText: { color: "#fff", fontSize: 18, fontFamily: "AirbnbCereal-Medium", marginBottom: 10, textAlign: "center" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 25, height: 40, marginBottom: 10 },
  searchInput: { flex: 1, paddingHorizontal: 8, fontFamily: "AirbnbCereal-Medium", color: "#333" },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
<<<<<<< HEAD
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  mainContent: { 
    flex: 1, 
    backgroundColor: "#f9f9f9", 
    // removed horizontal padding
  },
  sectionTitle: { 
    fontSize: 18, 
    marginTop: 20, 
    marginLeft: 10, // Added 5pt offset
    fontFamily: "AirbnbCereal-Medium", 
    color: "#333" 
  },
  feedSectionTitle: { 
    fontSize: 18, 
    marginTop: 10, 
    marginLeft: 10, // Added 5pt offset
    fontFamily: "AirbnbCereal-Medium", 
    color: "#333" 
  },
=======
  },
  filterText: { color: "#fff", fontFamily: "AirbnbCereal-Medium", fontSize: 14 },
  mainContent: { flex: 1, paddingHorizontal: 20, backgroundColor: "#f9f9f9" },
  sectionTitle: { fontSize: 18, marginTop: 20, fontFamily: "AirbnbCereal-Medium", color: "#333" },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  dateBox: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 50,
    height: 35,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  dateDayText: { fontSize: 17, fontWeight: "bold", color: "#fff", lineHeight: 19 },
  dateMonthText: { fontSize: 7, color: "#fff" },
<<<<<<< HEAD
  /* --- Updated Event Card --- */
  eventCard: {
    width: width * 0.6,
    marginRight: 15,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
=======
  eventCard: {
    width: width * 0.6,
    marginRight: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 10,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
<<<<<<< HEAD
    shadowRadius: 5,
    marginBottom: 10,
    position: "relative",
    overflow: "visible",
=======
    shadowRadius: 4,
    marginBottom: 10,
    position: "relative",
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  },
  eventImage: { width: "100%", height: 100, borderRadius: 8, marginTop: 40, marginBottom: 8, resizeMode: "cover" },
  noImagePlaceholder: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginTop: 40,
    marginBottom: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  eventTitle: { fontSize: 16, fontFamily: "AirbnbCereal-Medium", color: "#333", marginBottom: 4 },
  eventLocation: { fontSize: 14, fontFamily: "AirbnbCereal-Medium", color: "#333" },
<<<<<<< HEAD
  /* --- Updated Feed Card --- */
  feedCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 12,  // keeps posts slimer by ~1/4 inch on each side
    borderWidth: 1,
    borderColor: "#ccc",
=======
  feedCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
<<<<<<< HEAD
    shadowRadius: 5,
    overflow: "visible",
  },
  /* --- Updated Floating Action Button --- */
  fab: {
    position: "absolute",
    bottom: 70, // lowered accordingly
    alignSelf: "center",
=======
    shadowRadius: 4,
    position: "relative",
  },
  feedTimeContent: { fontSize: 10, color: "#666", marginTop: 4 },
  feedTitle: { fontSize: 16, fontFamily: "AirbnbCereal-Medium", color: "#333", marginTop: 50, marginBottom: 5 },
  feedText: { fontSize: 14, color: "#333", fontFamily: "AirbnbCereal-Medium", marginBottom: 10 },
  fab: {
    position: "absolute",
    bottom: 60,
    right: 180,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
<<<<<<< HEAD
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    zIndex: 100,
  },
  navBar: {
    position: "absolute",
    bottom: 0, // raised nav bar
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 20, // increased vertical padding if desired
    borderTopWidth: 1,
    borderTopColor: "#eee",
    zIndex: 99,
    marginBottom: 0,

=======
    elevation: 4,
    zIndex: 99,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, fontFamily: "AirbnbCereal-Medium", marginTop: 4 },
  postModal: {
    position: "absolute",
    left: 0,
    right: 0,
<<<<<<< HEAD
    height: windowHeight * 1,
=======
    height: windowHeight * 0.8,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    zIndex: 101,
  },
  modalCloseButton: { alignSelf: "flex-end" },
  modalTitle: { fontSize: 20, fontFamily: "AirbnbCereal-Medium", marginVertical: 10 },
  modalInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10, height: 100, textAlignVertical: "top", marginBottom: 20 },
  modalSubmitButton: { paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalSubmitText: { color: "#fff", fontSize: 16, fontFamily: "AirbnbCereal-Medium" },
  actionButtons: { position: "absolute", top: 5, right: 5, flexDirection: "row", zIndex: 10 },
<<<<<<< HEAD
  /* --- Updated Action Buttons --- */
  iconButton: { padding: 4, borderRadius: 6, marginLeft: 3 },
  deleteCommentButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 0, // minimal padding
    // backgroundColor removed to avoid red square
    zIndex: 11,
  },
  commentsContainer: { marginTop: 10 },
  commentItem: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 5, position: "relative" },
  commentUser: { fontSize: 14, fontWeight: "bold", color: "#333" },
  commentContent: {
    fontSize: 14, // changed from 16 to 14
    fontWeight: "bold",
    color: "#333",
    fontFamily: "AirbnbCereal-Medium",
  },
=======
  iconButton: { padding: 6, borderRadius: 6, marginLeft: 5 },
  deleteIconButton: { backgroundColor: "#FF4444" },
  editIconButton: {},
  deleteCommentButton: { position: "absolute", top: 0, right: 0, backgroundColor: "#FF4444", padding: 4, borderRadius: 4 },
  commentsContainer: { marginTop: 10 },
  commentItem: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 5, position: "relative" },
  commentUser: { fontSize: 14, fontWeight: "bold", color: "#333" },
  commentContent: { fontSize: 12, color: "#333" },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  commentDate: { fontSize: 10, color: "#666", marginTop: 2 },
  viewCommentsText: { fontSize: 14, fontWeight: "bold" },
  commentInputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, height: 40, fontFamily: "AirbnbCereal-Medium", color: "#333" },
  commentSubmitButton: { padding: 10, borderRadius: 8, marginLeft: 10 },
  disabledButton: { backgroundColor: "#aaa" },
  commentSubmitText: { fontFamily: "AirbnbCereal-Medium", color: "#fff", fontSize: 16 },
<<<<<<< HEAD
  filterOverlay: { 
    flex: 1,
    // Instead of a dark overlay with shadow, use a blue-tinted background or a BlurView wrapper.
    backgroundColor: "transparent",
    // Optionally, if you wish to use a blur effect, you can remove backgroundColor and wrap filterContainer in a BlurView.
    justifyContent: "center",
    alignItems: "center",
  },
=======
  filterOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  filterContainer: { width: "90%", maxHeight: "80%", backgroundColor: "#fff", borderRadius: 10, padding: 20 },
  filterTitle: { fontSize: 18, fontFamily: "AirbnbCereal-Medium", marginBottom: 10, textAlign: "center", color: "#333" },
  filterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 8 },
  filterLabel: { fontSize: 16, fontFamily: "AirbnbCereal-Medium", color: "#333" },
  filterInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8, width: "50%", textAlign: "center" },
  filterOptions: { flexDirection: "row", justifyContent: "space-between", width: "60%" },
  filterOption: { fontSize: 14, color: "#333", paddingHorizontal: 5 },
  filterOptionActive: { fontWeight: "bold" },
  filterButtonsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  filterApplyButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  filterCancelButton: { backgroundColor: "#FF4444", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  filterButtonText: { color: "#fff", fontFamily: "AirbnbCereal-Medium", fontSize: 16 },
<<<<<<< HEAD
  filterText: { color: "#fff", fontFamily: "AirbnbCereal-Medium", fontSize: 16 },
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  authorContainer: { flexDirection: "row", alignItems: "center" },
  authorPic: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  authorName: { fontSize: 14, fontFamily: "AirbnbCereal-Medium", color: "#333" },
  likeButton: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  likeCount: { marginLeft: 5, fontSize: 14, color: "#333" },
<<<<<<< HEAD
  searchPopup: { 
    position: "absolute", 
    top: 100, // Adjust this value so it sits right below your search container
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
    maxHeight: 300, // Limit the height, making it scrollable if needed
  },
=======
  searchPopup: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 10, zIndex: 100 },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  searchPopupHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  searchPopupHandle: { width: 40, height: 5, backgroundColor: "#ccc", borderRadius: 2.5, position: "absolute", top: 5 },
  searchPopupTitle: { fontSize: 16, fontFamily: "AirbnbCereal-Medium", color: "#333" },
  searchResultItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  searchResultText: { fontSize: 14, fontFamily: "AirbnbCereal-Medium", color: "#333" },
  eventButtonContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  eventButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: "#ddd" },
  eventButtonActive: { backgroundColor: "#333" },
  eventButtonText: { fontSize: 14, fontFamily: "AirbnbCereal-Medium", color: "#333" },
  eventDateInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10, marginBottom: 10 },
<<<<<<< HEAD
  fabBlueBackground: {
    position: "absolute",
    bottom: 70, // lowered to sit above the raised nav bar
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
  feedContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "transparent",
    overflow: "visible",
  },
  authorContainerCustom: {
    position: "absolute",
    top: 10,
    left: 70,
    flexDirection: "row",
    alignItems: "center",
  },
  feedContent: {
    marginTop: 50, // Adjust as needed
  },
  feedTitle: {
    fontSize: 20,                     // bigger font size
    fontWeight: "bold",               // bold
    color: "#333",
    fontFamily: "AirbnbCereal-Medium",
    marginBottom: 5,
  },
  feedText: {
    fontSize: 16,                     // smaller than title
    fontWeight: "bold",               // bold text for body
    color: "#333",
    fontFamily: "AirbnbCereal-Medium",
  },
  feedTimeContent: {
    fontSize: 12,                     // small font for time
    fontWeight: "200",                // thin appearance
    color: "#777",
    fontFamily: "AirbnbCereal-Medium", // adjust if you have a light variant
    marginVertical: 3,
  },
});
export default HomePage;
=======
});

export default HomePage;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
