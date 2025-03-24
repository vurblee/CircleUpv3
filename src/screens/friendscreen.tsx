import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  friend_username?: string;
  name?: string; // This is the accepted friend's name from the backend.
}

const FriendsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<"current" | "requests">("current");
  const [currentFriends, setCurrentFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  // Animated modal for current friend options
  const modalAnim = useRef(new Animated.Value(0)).current;
  const [optionsModalVisible, setOptionsModalVisible] = useState<boolean>(false);

  // Animated modal for pending friend options
  const pendingModalAnim = useRef(new Animated.Value(0)).current;
  const [pendingModalVisible, setPendingModalVisible] = useState<boolean>(false);

  // State for "Add Friend" modal
  const [addFriendModalVisible, setAddFriendModalVisible] = useState<boolean>(false);
  const [friendSearchText, setFriendSearchText] = useState<string>("");

<<<<<<< HEAD
  // Fetch accepted friends
=======
  // Fetch accepted friends (expected to return objects with "id" and "name")
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const fetchCurrentFriends = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      const response = await axios.get("http://192.168.1.231:5000/api/friends", {
=======
      const response = await axios.get("http://10.0.2.2:5000/api/friends", {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentFriends(response.data);
    } catch (error) {
      console.error("Error fetching current friends:", error);
<<<<<<< HEAD
      Alert.alert("Error", "Failed to fetch current friends.");
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // Fetch pending friend requests
=======
  // Fetch pending friend requests (which includes sender_name)
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      const response = await axios.get("http://192.168.1.231:5000/api/friends/pending", {
=======
      const response = await axios.get("http://10.0.2.2:5000/api/friends/pending", {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
<<<<<<< HEAD
      Alert.alert("Error", "Failed to fetch pending requests.");
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    await Promise.all([fetchCurrentFriends(), fetchPendingRequests()]);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // ----- CURRENT FRIENDS OPTIONS MODAL -----
  const openOptionsModal = (friend: Friend) => {
    setSelectedFriend(friend);
    setOptionsModalVisible(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeOptionsModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setOptionsModalVisible(false);
      setSelectedFriend(null);
    });
  };

  // ----- PENDING FRIEND REQUESTS MODAL (Accept/Deny) -----
  const openPendingModal = (friend: Friend) => {
    setSelectedFriend(friend);
    setPendingModalVisible(true);
    Animated.timing(pendingModalAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closePendingModal = () => {
    Animated.timing(pendingModalAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setPendingModalVisible(false);
      setSelectedFriend(null);
    });
  };

  // Option actions for current friends
  const sendMessage = () => {
    closeOptionsModal();
    const friendId = selectedFriend?.friend_id || selectedFriend?.user_id;
    navigation.navigate("ChatScreen", { partnerId: friendId });
  };

  const shareProfile = () => {
    closeOptionsModal();
    console.log("Share profile for:", selectedFriend);
<<<<<<< HEAD
    // Implement sharing logic here (e.g., using expo-sharing if needed)
=======
    // Implement sharing logic here
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  };

  // Remove friend action
  const removeFriend = async () => {
    if (!selectedFriend) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
      const loggedInUserId = await AsyncStorage.getItem("userId");
      let friendIdToRemove = "";
      if (selectedFriend.user_id === loggedInUserId) {
        friendIdToRemove = selectedFriend.friend_id;
      } else {
        friendIdToRemove = selectedFriend.user_id;
      }
<<<<<<< HEAD
      await axios.delete(`http://192.168.1.231:5000/api/friends/${friendIdToRemove}`, {
=======
      await axios.delete(`http://10.0.2.2:5000/api/friends/${friendIdToRemove}`, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchFriends();
      closeOptionsModal();
<<<<<<< HEAD
      Alert.alert("Success", "Friend removed successfully!");
    } catch (error) {
      console.error("Error removing friend:", error);
      Alert.alert("Error", "Failed to remove friend.");
=======
    } catch (error) {
      console.error("Error removing friend:", error);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  };

  // Actions for pending friend requests
  const acceptRequest = async () => {
    if (!selectedFriend) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.put(
<<<<<<< HEAD
        `http://192.168.1.231:5000/api/friends/${selectedFriend.user_id}/accept`,
=======
        `http://10.0.2.2:5000/api/friends/${selectedFriend.user_id}/accept`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchFriends();
      closePendingModal();
<<<<<<< HEAD
      Alert.alert("Success", "Friend request accepted!");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Alert.alert("Error", "Failed to accept friend request.");
=======
    } catch (error) {
      console.error("Error accepting friend request:", error);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  };

  const denyRequest = async () => {
    if (!selectedFriend) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.put(
<<<<<<< HEAD
        `http://192.168.1.231:5000/api/friends/${selectedFriend.user_id}/decline`,
=======
        `http://10.0.2.2:5000/api/friends/${selectedFriend.user_id}/decline`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchFriends();
      closePendingModal();
<<<<<<< HEAD
      Alert.alert("Success", "Friend request denied!");
    } catch (error) {
      console.error("Error declining friend request:", error);
      Alert.alert("Error", "Failed to deny friend request.");
=======
    } catch (error) {
      console.error("Error declining friend request:", error);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  };

  // "Add Friend" action – using username search
  const addFriend = async () => {
<<<<<<< HEAD
    if (!friendSearchText.trim()) {
      Alert.alert("Error", "Please enter a username.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
      const searchResponse = await axios.get(
        `http://192.168.1.231:5000/api/users/search?query=${friendSearchText.trim()}`,
=======
    if (!friendSearchText.trim()) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
      const searchResponse = await axios.get(
        `http://10.0.2.2:5000/api/users/search?query=${friendSearchText.trim()}`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!searchResponse.data || searchResponse.data.length === 0) {
        Alert.alert("User not found", "No user found with that username.");
        return;
      }
      const friendId = searchResponse.data[0].id;
      await axios.post(
<<<<<<< HEAD
        "http://192.168.1.231:5000/api/friends/requests",
=======
        "http://10.0.2.2:5000/api/friends/requests",
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        { friend_id: friendId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriendSearchText("");
      setAddFriendModalVisible(false);
      await fetchFriends();
<<<<<<< HEAD
      Alert.alert("Success", "Friend request sent!");
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", "Could not send friend request.");
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
<<<<<<< HEAD
=======
    // Use the "name" field returned by the backend.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    const displayName = item.name ? item.name : `User ${item.friend_id || item.user_id}`;
    return (
      <TouchableOpacity style={styles.friendItem} onPress={() => openOptionsModal(item)}>
        <Text style={styles.friendName}>{displayName}</Text>
        <Ionicons name="chevron-forward" size={20} color="#0A58CA" />
      </TouchableOpacity>
    );
  };

  const renderRequestItem = ({ item }: { item: Friend }) => {
<<<<<<< HEAD
=======
    // For pending requests, use sender_name if available.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    const senderDisplay = item.sender_name ? item.sender_name : `User ${item.user_id}`;
    return (
      <TouchableOpacity style={styles.friendItem} onPress={() => openPendingModal(item)}>
        <Text style={styles.friendName}>{senderDisplay}</Text>
        <Ionicons name="chevron-forward" size={20} color="#0A58CA" />
      </TouchableOpacity>
    );
  };

  const optionsModalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });
  const pendingModalScale = pendingModalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A58CA" />
        </View>
      )}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#000" />
=======
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "current" && styles.activeTab]}
          onPress={() => setSelectedTab("current")}
        >
          <Text style={selectedTab === "current" ? styles.activeTabText : styles.tabText}>
            Current
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "requests" && styles.activeTab]}
          onPress={() => setSelectedTab("requests")}
        >
          <Text style={selectedTab === "requests" ? styles.activeTabText : styles.tabText}>
            Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Friends List */}
      {selectedTab === "current" ? (
        <FlatList
          data={currentFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriendItem}
          contentContainerStyle={styles.listContainer}
<<<<<<< HEAD
          ListEmptyComponent={<Text style={styles.emptyText}>No current friends.</Text>}
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        />
      ) : (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContainer}
<<<<<<< HEAD
          ListEmptyComponent={<Text style={styles.emptyText}>No pending requests.</Text>}
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        />
      )}

      {/* Add Friends Button */}
      <TouchableOpacity style={styles.addFriendsButton} onPress={() => setAddFriendModalVisible(true)}>
        <Ionicons name="person-add" size={24} color="#fff" />
        <Text style={styles.addFriendsText}>Add Friends</Text>
      </TouchableOpacity>

      {/* Animated Options Modal for Current Friends */}
      {optionsModalVisible && selectedFriend && (
<<<<<<< HEAD
        <Modal transparent={true} animationType="none" visible={optionsModalVisible}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContainer, { transform: [{ scale: optionsModalScale }] }]}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Options</Text>
                <TouchableOpacity style={styles.modalOption} onPress={sendMessage}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#0A58CA" />
                  <Text style={styles.modalOptionText}>Send Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={shareProfile}>
                  <Ionicons name="share-social" size={20} color="#0A58CA" />
                  <Text style={styles.modalOptionText}>Share Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={removeFriend}>
                  <Ionicons name="trash" size={20} color="#FF5A5F" />
                  <Text style={[styles.modalOptionText, { color: "#FF5A5F" }]}>Remove Friend</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCloseButton} onPress={closeOptionsModal}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
=======
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: optionsModalScale }] }]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Options</Text>
            <TouchableOpacity style={styles.modalOption} onPress={sendMessage}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#0A58CA" />
              <Text style={styles.modalOptionText}>Send Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={shareProfile}>
              <Ionicons name="share-social" size={20} color="#0A58CA" />
              <Text style={styles.modalOptionText}>Share Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={removeFriend}>
              <Ionicons name="trash" size={20} color="#FF5A5F" />
              <Text style={[styles.modalOptionText, { color: "#FF5A5F" }]}>Remove Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeOptionsModal}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </Animated.View>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      )}

      {/* Animated Pending Modal for Friend Requests */}
      {pendingModalVisible && selectedFriend && (
<<<<<<< HEAD
        <Modal transparent={true} animationType="none" visible={pendingModalVisible}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContainer, { transform: [{ scale: pendingModalScale }] }]}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Friend Request</Text>
                <TouchableOpacity style={styles.modalOption} onPress={acceptRequest}>
                  <Ionicons name="checkmark" size={20} color="#0A58CA" />
                  <Text style={styles.modalOptionText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={denyRequest}>
                  <Ionicons name="close" size={20} color="#FF5A5F" />
                  <Text style={[styles.modalOptionText, { color: "#FF5A5F" }]}>Deny</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCloseButton} onPress={closePendingModal}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
=======
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: pendingModalScale }] }]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Friend Request</Text>
            <TouchableOpacity style={styles.modalOption} onPress={acceptRequest}>
              <Ionicons name="checkmark" size={20} color="#0A58CA" />
              <Text style={styles.modalOptionText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={denyRequest}>
              <Ionicons name="close" size={20} color="#FF5A5F" />
              <Text style={[styles.modalOptionText, { color: "#FF5A5F" }]}>Deny</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closePendingModal}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </Animated.View>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      )}

      {/* Add Friend Modal */}
      <Modal
        visible={addFriendModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddFriendModalVisible(false)}
      >
        <View style={styles.addModalContainer}>
          <View style={styles.addModalContent}>
            <Text style={styles.modalTitle}>Add a Friend</Text>
            <TextInput
              style={styles.addModalInput}
              placeholder="Enter friend's username"
              value={friendSearchText}
              onChangeText={setFriendSearchText}
            />
            <View style={styles.addModalButtons}>
              <TouchableOpacity style={styles.addModalButton} onPress={addFriend}>
                <Text style={styles.addModalButtonText}>Send Request</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addModalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setAddFriendModalVisible(false)}
              >
                <Text style={[styles.addModalButtonText, { color: "#000" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
<<<<<<< HEAD
  loadingContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.8)" },
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
<<<<<<< HEAD
    paddingTop: 50,
    // Removed borderBottomWidth and borderBottomColor to get rid of the border
  },
  backButton: { position: "absolute", left: 20, top: 70 },
  headerTitle: { 
    fontSize: 22,
    marginTop: 20, // Lower the title
    fontFamily: "AirbnbCereal_Md", 
    color: "#000" 
  },
=======
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: { position: "absolute", left: 20, top: 40 },
  headerTitle: { fontSize: 24, fontFamily: "AirbnbCereal_Md", color: "#000" },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
    marginHorizontal: 20,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 25,
  },
  tabText: { color: "#888", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
  activeTab: { backgroundColor: "#fff" },
  activeTabText: { color: "#000", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
<<<<<<< HEAD
  listContainer: { paddingBottom: 80 },
=======
  listContainer: { paddingHorizontal: 20, paddingBottom: 80 },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    justifyContent: "space-between",
<<<<<<< HEAD
    paddingHorizontal: 0, // Remove padding to make the border seamless
  },
  friendName: { 
    fontSize: 16, 
    fontFamily: "AirbnbCereal_Md", 
    color: "#000",
    paddingLeft: 20, // Add padding to move the name to the right
  },
  emptyText: { textAlign: "center", color: "#888", fontSize: 16, marginTop: 20 },
  addFriendsButton: {
    position: "absolute",
    bottom: 40, // Raised the button
=======
  },
  friendName: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#000" },
  addFriendsButton: {
    position: "absolute",
    bottom: 20,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    left: "20%",
    right: "20%",
    backgroundColor: "#0A58CA",
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  addFriendsText: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#fff" },
<<<<<<< HEAD
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
=======
  modalContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
<<<<<<< HEAD
    width: width * 0.8,
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  },
  modalContent: { alignItems: "center" },
  modalTitle: { fontSize: 20, fontFamily: "AirbnbCereal_Md", marginBottom: 15 },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    color: "#0A58CA",
    marginLeft: 10,
  },
  modalCloseButton: { marginTop: 15 },
  addModalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },
  addModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  addModalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginVertical: 15,
    fontFamily: "AirbnbCereal_Md",
  },
  addModalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  addModalButton: {
    backgroundColor: "#0A58CA",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addModalButtonText: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    color: "#fff",
  },
<<<<<<< HEAD
});

export default FriendsScreen;
=======
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 25 },
  tabText: { color: "#888", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
  activeTab: { backgroundColor: "#fff" },
  activeTabText: { color: "#000", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
  // Modal styles for friend options and pending requests
  modalContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContent: { alignItems: "center" },
  // Filter overlay styles
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: "AirbnbCereal_Md",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  filterLabel: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#333" },
  filterInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    width: "50%",
    textAlign: "center",
  },
  filterOptions: { flexDirection: "row", justifyContent: "space-between", width: "60%" },
  filterOption: { fontSize: 14, color: "#333", paddingHorizontal: 5 },
  filterOptionActive: { fontWeight: "bold", color: "#0A58CA" },
  filterButtonsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  filterApplyButton: { backgroundColor: "#0A58CA", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  filterCancelButton: { backgroundColor: "#FF4444", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  filterButtonText: { color: "#fff", fontFamily: "AirbnbCereal_Md", fontSize: 16 },
});

export default FriendsScreen;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
