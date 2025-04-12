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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../api/apiClient";
import { useTheme } from "../providers/ThemeContext";

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
  name?: string;
  profile_picture?: string;
}

const FriendsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [selectedTab, setSelectedTab] = useState<"current" | "requests">("current");
  const [currentFriends, setCurrentFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [currentConversations, setCurrentConversations] = useState<any[]>([]);

  const modalAnim = useRef(new Animated.Value(0)).current;
  const [optionsModalVisible, setOptionsModalVisible] = useState<boolean>(false);
  const pendingModalAnim = useRef(new Animated.Value(0)).current;
  const [pendingModalVisible, setPendingModalVisible] = useState<boolean>(false);
  const [addFriendModalVisible, setAddFriendModalVisible] = useState<boolean>(false);
  const [friendSearchText, setFriendSearchText] = useState<string>("");

  // Fetch functions remain unchanged
  const fetchCurrentFriends = async () => {
    try {
      setLoading(true);
      await apiClient.get("/friends").then((response) => {
        setCurrentFriends(response.data);
      });
    } catch (error) {
      console.error("Error fetching current friends:", error);
      Alert.alert("Error", "Failed to fetch current friends.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      await apiClient.get("/friends/pending").then((response) => {
        setPendingRequests(response.data);
      });
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      Alert.alert("Error", "Failed to fetch pending requests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentConversations = async () => {
    try {
      await apiClient.get("/conversations").then((response) => {
        setCurrentConversations(response.data);
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      Alert.alert("Error", "Failed to fetch conversations.");
    }
  };

  const fetchFriends = async () => {
    await Promise.all([fetchCurrentFriends(), fetchPendingRequests(), fetchCurrentConversations()]);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Modal and action handlers
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

  const sendMessage = () => {
    if (!selectedFriend) {
      Alert.alert("Error", "No friend selected.");
      closeOptionsModal();
      return;
    }

    const friendId = selectedFriend?.friend_id || selectedFriend?.user_id || selectedFriend?.id;
    if (!friendId || friendId === "undefined") {
      Alert.alert("Error", "Invalid friend ID. Cannot open the chat.");
      closeOptionsModal();
      return;
    }

    navigation.navigate("Messages", { friendId });
    closeOptionsModal();
  };

  const shareProfile = () => {
    setOptionsModalVisible(false);
    setShareModalVisible(true);
  };

  const sendProfileLink = async (selected: Friend, recipient: Friend) => {
    const profileLink = `https://yourapp.com/profile/${selected.id}`;
    try {
      // Send a notification to the recipient with the profile link
      await apiClient.post("/notifications", {
        user_id: recipient.friend_id || recipient.user_id || recipient.id, // Recipient's ID
        type: "profile_share",
        message: `You have received a profile link: ${profileLink}`,
        related_id: selected.id, // ID of the profile being shared
      });
      Alert.alert(
        "Profile Shared",
        `Shared profile link:\n${profileLink}\nwith ${recipient.name || recipient.friend_username || recipient.id}. They have been notified.`
      );
    } catch (error) {
      console.error("Error sending profile link notification:", error);
      Alert.alert("Error", "Failed to share profile link.");
    } finally {
      setShareModalVisible(false);
    }
  };

  const removeFriend = async () => {
    if (!selectedFriend) return;

    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${selectedFriend.name || "this friend"}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              if (!selectedFriend.id) {
                Alert.alert("Error", "Invalid friend ID.");
                return;
              }

              const friendIdToRemove = selectedFriend.id;
              await apiClient.delete(`/friends/${friendIdToRemove}`);
              await fetchFriends();
              closeOptionsModal();
              Alert.alert("Success", "Friend removed successfully!");
            } catch (error) {
              console.error("Error removing friend:", error);
              Alert.alert("Error", "Failed to remove friend.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const acceptRequest = async () => {
    if (!selectedFriend) return;
    try {
      await apiClient.put(`/friends/${selectedFriend.user_id}/accept`, {});
      await fetchFriends();
      closePendingModal();
      Alert.alert("Success", "Friend request accepted!");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Alert.alert("Error", "Failed to accept friend request.");
    }
  };

  const denyRequest = async () => {
    if (!selectedFriend) return;
    try {
      await apiClient.put(`/friends/${selectedFriend.user_id}/decline`, {});
      await fetchFriends();
      closePendingModal();
      Alert.alert("Success", "Friend request denied!");
    } catch (error) {
      console.error("Error declining friend request:", error);
      Alert.alert("Error", "Failed to deny friend request.");
    }
  };

  const addFriend = async () => {
    if (!friendSearchText.trim()) {
      Alert.alert("Error", "Please enter a username.");
      return;
    }
    try {
      const searchResponse = await apiClient.get("/users/search", {
        params: { query: friendSearchText.trim() },
      });
      if (!searchResponse.data || searchResponse.data.length === 0) {
        Alert.alert("User not found", "No user found with that username.");
        return;
      }
      const friendId = searchResponse.data[0].id;
      await apiClient.post("/friends/requests", { friend_id: friendId });
      setFriendSearchText("");
      setAddFriendModalVisible(false);
      await fetchFriends();
      Alert.alert("Success", "Friend request sent! The user has been notified.");
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", "Could not send friend request.");
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const displayName = item.name ? item.name : `User ${item.friend_id || item.user_id}`;
    return (
      <TouchableOpacity style={styles.friendItem} onPress={() => openOptionsModal(item)}>
        <Image
          source={{
            uri: item.profile_picture ? item.profile_picture : "https://via.placeholder.com/50",
          }}
          style={styles.friendPic}
        />
        <Text style={styles.friendName}>{displayName}</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.mode === "blackAndWhite" ? "#000000" : theme.text} />
      </TouchableOpacity>
    );
  };

  const renderRequestItem = ({ item }: { item: Friend }) => {
    const senderDisplay = item.sender_name ? item.sender_name : `User ${item.user_id}`;
    return (
      <TouchableOpacity style={styles.friendItem} onPress={() => openPendingModal(item)}>
        <Image
          source={{
            uri: item.profile_picture ? item.profile_picture : "https://via.placeholder.com/50",
          }}
          style={styles.friendPic}
        />
        <Text style={styles.friendName}>{senderDisplay}</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.mode === "blackAndWhite" ? "#000000" : theme.text} />
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
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A58CA" />
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.mode === "blackAndWhite" ? "#000000" : theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
      </View>

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

      {selectedTab === "current" ? (
        <FlatList
          data={currentFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriendItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No current friends.</Text>}
        />
      ) : (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending requests.</Text>}
        />
      )}

      <TouchableOpacity style={styles.addFriendsButton} onPress={() => setAddFriendModalVisible(true)}>
        <Ionicons name="person-add" size={24} color={styles.addFriendsIcon.color} />
        <Text style={styles.addFriendsText}>Add Friends</Text>
      </TouchableOpacity>

      {optionsModalVisible && selectedFriend && (
        <Modal transparent={true} animationType="none" visible={optionsModalVisible}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContainer, { transform: [{ scale: optionsModalScale }] }]}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Options</Text>
                <TouchableOpacity style={styles.modalOption} onPress={sendMessage}>
                  <Ionicons name="chatbubble-ellipses" size={20} style={styles.modalOptionIcon} />
                  <Text style={styles.modalOptionText}>Send Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={shareProfile}>
                  <Ionicons name="share-social" size={20} style={styles.modalOptionIcon} />
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
      )}

      {pendingModalVisible && selectedFriend && (
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
      )}

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

      {shareModalVisible && selectedFriend && (
        <Modal transparent={true} animationType="none" visible={shareModalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Share Profile with:</Text>
              <FlatList
                data={currentFriends}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => sendProfileLink(selectedFriend, item)}
                  >
                    <Image
                      source={{
                        uri: item.profile_picture
                          ? item.profile_picture
                          : "https://via.placeholder.com/50",
                      }}
                      style={styles.friendPic}
                    />
                    <Text style={styles.modalOptionText}>
                      {item.name || item.friend_username || item.id}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShareModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.mode === "blackAndWhite" ? "#ffffff" : theme.background,
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.8)",
    },
    header: {
      backgroundColor: theme.mode === "blackAndWhite" ? "#ffffff" : theme.background,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
      paddingTop: 50,
    },
    backButton: { position: "absolute", left: 20, top: 70 },
    headerTitle: { 
      fontSize: 22,
      marginTop: 20,
      fontFamily: "AirbnbCereal_Md", 
      color: theme.mode === "blackAndWhite" ? "#000000" : theme.text 
    },
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
    tabText: { 
      color: "#888", 
      fontSize: 16, 
      fontFamily: "AirbnbCereal_Md" 
    },
    activeTab: { 
      backgroundColor: "#fff" 
    },
    activeTabText: { 
      color: theme.mode === "blackAndWhite" ? "#000000" : theme.text, 
      fontSize: 16, 
      fontFamily: "AirbnbCereal_Md" 
    },
    listContainer: { 
      paddingBottom: 80 
    },
    friendItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      justifyContent: "space-between",
      paddingHorizontal: 10,
    },
    friendName: { 
      fontSize: 16, 
      fontFamily: "AirbnbCereal_Md", 
      color: theme.mode === "blackAndWhite" ? "#000000" : theme.text,
      marginLeft: -230,
    },
    friendPic: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
    },
    emptyText: { 
      textAlign: "center", 
      color: "#888", 
      fontSize: 16, 
      marginTop: 20 
    },
    addFriendsButton: {
      position: "absolute",
      bottom: 40,
      left: "20%",
      right: "20%",
      backgroundColor: theme.mode === "blackAndWhite" ? "#000000" : theme.primary,
      paddingVertical: 15,
      borderRadius: 25,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    addFriendsIcon: {
      color: theme.mode === "blackAndWhite" ? "#ffffff" : "#ffffff",
    },
    addFriendsText: { 
      fontSize: 16, 
      fontFamily: "AirbnbCereal_Md", 
      color: theme.mode === "blackAndWhite" ? "#ffffff" : "#ffffff",
    },
    modalOverlay: { 
      flex: 1, 
      backgroundColor: "rgba(0,0,0,0.5)", 
      justifyContent: "center", 
      alignItems: "center" 
    },
    modalContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: 20,
      padding: 20,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      width: width * 0.8,
    },
    modalContent: { 
      alignItems: "center" 
    },
    modalTitle: { 
      fontSize: 20, 
      fontFamily: "AirbnbCereal_Md", 
      marginBottom: 15,
      color: theme.mode === "blackAndWhite" ? "#000000" : theme.text
    },
    modalOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      width: "100%",
    },
    modalOptionText: {
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
      color: theme.mode === "blackAndWhite" ? "#000000" : theme.primary,
      marginLeft: 10,
    },
    modalOptionIcon: {
      color: theme.mode === "blackAndWhite" ? "#000000" : theme.primary,
    },
    modalCloseButton: { 
      marginTop: 15 
    },
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
      backgroundColor: theme.mode === "blackAndWhite" ? "#000000" : "#0A58CA",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
    },
    addModalButtonText: {
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
      color: "#fff",
    },
    actionButton: {
      backgroundColor: theme.mode === "blackAndWhite" ? "#000000" : theme.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 25,
      marginHorizontal: 20,
      marginTop: 10,
    },
    actionIcon: {
      color: theme.mode === "blackAndWhite" ? "#ffffff" : "#ffffff",
    },
    actionButtonText: {
      color: theme.mode === "blackAndWhite" ? "#ffffff" : "#ffffff",
      fontSize: 14,
      fontFamily: "AirbnbCereal_Md",
      marginLeft: 10,
    },
  });

export default FriendsScreen;