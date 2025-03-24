import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Platform,
<<<<<<< HEAD
=======
  StatusBar,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
<<<<<<< HEAD
import Header from "../components/header";
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

const { width, height } = Dimensions.get("window");

interface Conversation {
<<<<<<< HEAD
  conversation_id: string;
  last_updated: string;
  partner_id: string;
=======
  conversation_id: string; // UUID string
  last_updated: string;
  partner_id: string;      // The partner's UUID
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  friend_username?: string;
  friend_online?: boolean;
}

<<<<<<< HEAD
interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  name?: string;
  friend_username?: string;
  username?: string;
}

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
=======
const MessagesScreen: React.FC = () => {
  const navigation = useNavigation();
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([]);
  const [activeTab, setActiveTab] = useState<"current" | "deleted">("current");
  const [loading, setLoading] = useState<boolean>(true);
<<<<<<< HEAD
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedConvos, setSelectedConvos] = useState<Set<string>>(new Set());
  const [newChatModalVisible, setNewChatModalVisible] = useState<boolean>(false);
  const [friendSearchText, setFriendSearchText] = useState<string>("");
  const [friendsList, setFriendsList] = useState<Friend[]>([]);

=======

  // Edit mode state and selected conversation IDs for both tabs
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedConvos, setSelectedConvos] = useState<Set<string>>(new Set());

  // New Chat Modal state
  const [newChatModalVisible, setNewChatModalVisible] = useState<boolean>(false);
  const [friendSearchText, setFriendSearchText] = useState<string>("");
  const [friendsList, setFriendsList] = useState<any[]>([]);

  // Fetch conversation list from backend using /api/conversations endpoint.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      if (!token) {
        navigation.navigate("SignIn");
        setLoading(false);
        return;
      }
      const response = await axios.get("http://192.168.1.231:5000/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data || []);
      setDeletedConversations([]);
    } catch (error: any) {
      console.error("Error fetching conversations:", error.response?.data || error.message);
=======
      const response = await axios.get("http://10.0.2.2:5000/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Expect each conversation object to have a partner_id and friend_username
      setConversations(response.data);
      setDeletedConversations([]); // reset deleted list
    } catch (error) {
      console.error("Error fetching conversations:", error);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      Alert.alert("Error", "Unable to fetch conversations.");
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const fetchFriends = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      const response = await axios.get("http://192.168.1.231:5000/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendsList(response.data || []);
    } catch (error: any) {
      console.error("Error fetching friends list:", error.response?.data || error.message);
      setFriendsList([]);
=======
  // Fetch friends list for New Chat Modal.
  const fetchFriends = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get("http://10.0.2.2:5000/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendsList(response.data);
    } catch (error) {
      console.error("Error fetching friends list:", error);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchConversations(), fetchFriends()]);
      setLoading(false);
    };
    initializeData();
  }, []);

  const openNewChatModal = async () => {
    await fetchFriends(); // Refresh friends list when opening modal
    setNewChatModalVisible(true);
  };

  const filteredFriends = friendsList.filter((friend) =>
    (friend.name || friend.friend_username || friend.username || `User ${friend.friend_id || friend.user_id}`)
      .toLowerCase()
      .includes(friendSearchText.toLowerCase())
  );

=======
    fetchConversations();
  }, []);

  // Open New Chat Modal.
  const openNewChatModal = async () => {
    await fetchFriends();
    setNewChatModalVisible(true);
  };

  // Fuzzy search on friends list (case-insensitive).
  const filteredFriends = friendsList.filter((friend) => {
    const name =
      friend.friend_username ||
      friend.username ||
      `User ${friend.friend_id || friend.user_id}`;
    return name.toLowerCase().includes(friendSearchText.toLowerCase());
  });

  // Format time to "HH:MM" (without seconds).
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const formatTime = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateStr).toLocaleTimeString([], options);
  };

<<<<<<< HEAD
  const getUsernameFromId = (id: string): string => {
    const friend = friendsList.find((f) => String(f.friend_id || f.user_id) === id);
    return friend?.name || friend?.friend_username || friend?.username || `User ${id}`;
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const displayName = item.friend_username || getUsernameFromId(item.partner_id);
=======
  // Render a conversation row.
  // Use item.partner_id (returned from backend) as the partner's ID.
  const renderConversation = ({ item }: { item: Conversation }) => {
    const displayName = item.friend_username || `User ${item.partner_id}`;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    const timeString = item.last_updated ? formatTime(item.last_updated) : "";
    const isSelected = selectedConvos.has(item.conversation_id);

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => {
          if (editMode) {
            const newSelected = new Set(selectedConvos);
            if (newSelected.has(item.conversation_id)) {
              newSelected.delete(item.conversation_id);
            } else {
              newSelected.add(item.conversation_id);
            }
            setSelectedConvos(newSelected);
          } else {
            navigation.navigate("ChatScreen", {
              conversationId: item.conversation_id,
<<<<<<< HEAD
              partnerId: item.partner_id,
=======
              partnerId: item.partner_id, // Use partner_id from backend.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              partnerName: displayName,
            });
          }
        }}
        onLongPress={() => {
          if (activeTab === "current" && !editMode) {
            setEditMode(true);
            setSelectedConvos(new Set([item.conversation_id]));
          }
        }}
      >
<<<<<<< HEAD
        {editMode && <Text style={styles.checkbox}>{isSelected ? "[✓]" : "[ ]"}</Text>}
        <View style={styles.profileContainer}>
          <Image source={{ uri: "https://via.placeholder.com/50" }} style={styles.profilePic} />
=======
        {editMode && (
          <Text style={styles.checkbox}>
            {isSelected ? "[✓]" : "[ ]"}
          </Text>
        )}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/50" }}
            style={styles.profilePic}
          />
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          <View style={item.friend_online ? styles.onlineDot : styles.offlineDot} />
        </View>
        <View style={styles.conversationContent}>
          <Text style={styles.conversationName}>{displayName}</Text>
          <Text style={styles.conversationPreview} numberOfLines={1}>
            {/* Optionally display a last message preview */}
          </Text>
        </View>
        <Text style={styles.conversationTime}>{timeString}</Text>
      </TouchableOpacity>
    );
  };

<<<<<<< HEAD
=======
  // In Current tab, soft-delete selected conversations (move to Deleted).
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const handleCurrentDelete = () => {
    Alert.alert(
      "Delete Conversations",
      "Are you sure you want to delete the selected conversations?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const toDelete = conversations.filter((conv) =>
              selectedConvos.has(conv.conversation_id)
            );
            setDeletedConversations([...toDelete, ...deletedConversations]);
            setConversations(
              conversations.filter((conv) => !selectedConvos.has(conv.conversation_id))
            );
            setSelectedConvos(new Set());
            setEditMode(false);
          },
        },
      ]
    );
  };

<<<<<<< HEAD
=======
  // In Deleted tab, recover selected conversations.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const handleRecover = () => {
    Alert.alert(
      "Recover Conversations",
      "Are you sure you want to recover the selected conversations?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Recover",
          onPress: () => {
            const recovered = deletedConversations.filter((conv) =>
              selectedConvos.has(conv.conversation_id)
            );
            setConversations([...recovered, ...conversations]);
            setDeletedConversations(
              deletedConversations.filter((conv) => !selectedConvos.has(conv.conversation_id))
            );
            setSelectedConvos(new Set());
            setEditMode(false);
          },
        },
      ]
    );
  };

<<<<<<< HEAD
=======
  // In Deleted tab, permanently delete selected conversations.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const handlePermanentDelete = async () => {
    Alert.alert(
      "Delete Permanently",
      "Are you sure you want to permanently delete the selected conversations? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
            if (!token) {
              navigation.navigate("SignIn");
              return;
            }
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            const convsToDelete = deletedConversations.filter((conv) =>
              selectedConvos.has(conv.conversation_id)
            );
            for (const conv of convsToDelete) {
<<<<<<< HEAD
              try {
                await axios.delete(
                  `http://192.168.1.231:5000/api/conversations/${conv.conversation_id}/permanent`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } catch (err: any) {
                if (err.response?.status === 404) {
                  console.warn(`Conversation ${conv.conversation_id} not found, skipping deletion.`);
                } else {
                  console.error("Error permanently deleting conversation:", err.response?.data || err.message);
                }
              }
            }
            setDeletedConversations(
              deletedConversations.filter((conv) => !selectedConvos.has(conv.conversation_id))
            );
=======
              const convId = conv.conversation_id;
              try {
                await axios.delete(
                  `http://10.0.2.2:5000/api/conversations/${convId}/permanent`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } catch (err: any) {
                if (err.response && err.response.status === 404) {
                  console.warn(`Conversation ${convId} not found, skipping deletion.`);
                } else {
                  console.error("Error permanently deleting conversation:", err);
                }
              }
            }
            const remaining = deletedConversations.filter(
              (conv) => !selectedConvos.has(conv.conversation_id)
            );
            setDeletedConversations(remaining);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            setSelectedConvos(new Set());
            setEditMode(false);
          },
        },
      ]
    );
  };

<<<<<<< HEAD
  return (
    <View style={styles.container}>
      {/* Reusable Header with dynamic right component */}
      <Header
        title="Messages"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          editMode ? (
            <View style={styles.headerColumnContainerLeft}>
              {activeTab === "current" ? (
                <>
                  <TouchableOpacity style={styles.headerButton} onPress={handleCurrentDelete}>
                    <Text style={styles.headerButtonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => {
                      setEditMode(false);
                      setSelectedConvos(new Set());
                    }}
                  >
                    <Text style={styles.headerButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.headerButton} onPress={handleRecover}>
                    <Text style={styles.headerButtonText}>Recover</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerButton} onPress={handlePermanentDelete}>
                    <Text style={styles.headerButtonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => {
                      setEditMode(false);
                      setSelectedConvos(new Set());
                    }}
                  >
                    <Text style={styles.headerButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setEditMode(true);
                setSelectedConvos(new Set());
              }}
            >
              <Text style={styles.headerButtonText}>Edit</Text>
            </TouchableOpacity>
          )
        }
        // style={{ borderBottomWidth: 0 }} // Add this line to remove the border
      />

      {/* Adjusted Content Wrapper (directly under header) */}
      <View style={styles.contentWrapper}>
=======
  // Render header right based on active tab and edit mode.
  const renderHeaderRight = () => {
    if (activeTab === "current") {
      if (editMode) {
        return (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity style={styles.headerButton} onPress={handleCurrentDelete}>
              <Text style={styles.headerButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setEditMode(false);
                setSelectedConvos(new Set());
              }}
            >
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        return (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              setEditMode(true);
              setSelectedConvos(new Set());
            }}
          >
            <Text style={styles.headerButtonText}>Edit</Text>
          </TouchableOpacity>
        );
      }
    } else {
      // Deleted tab
      if (editMode) {
        return (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity style={styles.headerButton} onPress={handleRecover}>
              <Text style={styles.headerButtonText}>Recover</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handlePermanentDelete}>
              <Text style={styles.headerButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setEditMode(false);
                setSelectedConvos(new Set());
              }}
            >
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        return (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              setEditMode(true);
              setSelectedConvos(new Set());
            }}
          >
            <Text style={styles.headerButtonText}>Edit</Text>
          </TouchableOpacity>
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Messages</Text>
          </View>
          <View style={styles.headerRight}>{renderHeaderRight()}</View>
        </View>

>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "current" && styles.activeTab]}
            onPress={() => {
              setActiveTab("current");
              setEditMode(false);
            }}
          >
            <Text style={activeTab === "current" ? styles.activeTabText : styles.tabText}>
              Current
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "deleted" && styles.activeTab]}
            onPress={() => {
              setActiveTab("deleted");
              setEditMode(false);
            }}
          >
            <Text style={activeTab === "deleted" ? styles.activeTabText : styles.tabText}>
              Deleted
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conversation List */}
        {loading ? (
<<<<<<< HEAD
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#668CFF" />
          </View>
        ) : activeTab === "current" ? (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.conversation_id}
            renderItem={renderConversation}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No current conversations.</Text>}
=======
          <ActivityIndicator size="large" color="#668CFF" style={{ marginTop: 20 }} />
        ) : activeTab === "current" ? (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.conversation_id.toString()}
            renderItem={renderConversation}
            contentContainerStyle={styles.listContainer}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          />
        ) : (
          <FlatList
            data={deletedConversations}
<<<<<<< HEAD
            keyExtractor={(item) => item.conversation_id}
=======
            keyExtractor={(item) => item.conversation_id.toString()}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            renderItem={renderConversation}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No deleted conversations.</Text>}
          />
        )}
<<<<<<< HEAD
      </View>

      {/* Start a Chat Button */}
      <TouchableOpacity style={styles.chatButton} onPress={openNewChatModal}>
        <Text style={styles.chatButtonText}>Start a Chat</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
=======

        {/* Start a Chat Button */}
        <TouchableOpacity style={styles.chatButton} onPress={openNewChatModal}>
          <Text style={styles.chatButtonText}>Start a Chat</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

      {/* New Chat Modal */}
      <Modal
        visible={newChatModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNewChatModalVisible(false)}
      >
        <View style={styles.newChatModalContainer}>
          <View style={styles.newChatModalContent}>
            <Text style={styles.modalTitle}>Select a Friend</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              value={friendSearchText}
              onChangeText={setFriendSearchText}
            />
            <FlatList
              data={filteredFriends}
<<<<<<< HEAD
              keyExtractor={(item) => String(item.friend_id || item.user_id || item.id)}
              renderItem={({ item }) => {
                const partnerId = item.id;
                if (!partnerId) {
                  Alert.alert("Error", "Cannot start chat without a valid partner ID.");
                  return null;
                }
                const displayName =
                  item.name || item.friend_username || item.username || `User ${partnerId}`;
=======
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const displayName =
                  item.friend_username || `User ${item.friend_id || item.user_id}`;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                return (
                  <TouchableOpacity
                    style={styles.friendItem}
                    onPress={() => {
                      setNewChatModalVisible(false);
                      navigation.navigate("ChatScreen", {
<<<<<<< HEAD
                        partnerId: String(partnerId),
                        partnerName: displayName,
=======
                        partnerId: item.friend_id || item.user_id,
                        partnerName: item.friend_username,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
                      });
                    }}
                  >
                    <Text style={styles.friendName}>{displayName}</Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={<Text style={styles.emptyText}>No friends found.</Text>}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setNewChatModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
<<<<<<< HEAD
  headerColumnContainerLeft: {
    flexDirection: "column",
    alignItems: "flex-start",   // align items to the left
    marginLeft: -20,            // shift further left (adjust as needed)
  },
  headerButton: {
    paddingVertical: 5,
    marginVertical: 2,             // vertical spacing between buttons
    paddingHorizontal: 5,          // allow some horizontal padding without forcing truncation
  },
  headerButtonText: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    color: "#0A58CA",
    flexShrink: 0,                 // prevent shrinking that causes ellipsis
  },
  contentWrapper: { marginTop: 20, flex: 1 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 5,
=======
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingHorizontal: 10,
  },
  headerLeft: { flex: 1, alignItems: "flex-start" },
  headerCenter: { flex: 2, alignItems: "center" },
  headerRight: { flex: 1, alignItems: "flex-end" },
  headerTitle: { fontSize: 24, fontFamily: "AirbnbCereal_Md", color: "#000" },
  headerRightContainer: { flexDirection: "column", alignItems: "flex-end" },
  headerButton: { paddingVertical: 5 },
  headerButtonText: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#0A58CA" },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
    marginHorizontal: 20,
    padding: 3,
  },
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 25 },
  tabText: { color: "#888", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
  activeTab: { backgroundColor: "#fff" },
  activeTabText: { color: "#000", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
<<<<<<< HEAD
  listContainer: { paddingHorizontal: 0, paddingBottom: 50 },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
    fontFamily: "AirbnbCereal_Lt",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
=======
  listContainer: { paddingHorizontal: 10, paddingBottom: 80 },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#888" },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  profileContainer: { position: "relative" },
  profilePic: { width: 50, height: 50, borderRadius: 25 },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "green",
    borderWidth: 1,
    borderColor: "#fff",
  },
  offlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "red",
    borderWidth: 1,
    borderColor: "#fff",
  },
  conversationContent: { flex: 1, marginHorizontal: 10 },
  conversationName: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#000" },
  conversationPreview: { fontSize: 14, fontFamily: "AirbnbCereal_Lt", color: "#888" },
  conversationTime: { fontSize: 12, fontFamily: "AirbnbCereal_Lt", color: "#888", paddingRight: 10 },
  checkbox: { fontSize: 18, marginRight: 8, color: "#0A58CA" },
  chatButton: {
    position: "absolute",
<<<<<<< HEAD
    bottom: 40,
=======
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
  },
<<<<<<< HEAD
  chatButtonText: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#fff", marginRight: 5 },
=======
  chatButtonText: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#fff" },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  newChatModalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },
  newChatModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
  },
<<<<<<< HEAD
  modalTitle: { fontSize: 20, fontFamily: "AirbnbCereal_Md", color: "#000", textAlign: "center" },
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginVertical: 15,
    fontFamily: "AirbnbCereal_Md",
<<<<<<< HEAD
    color: "#000",
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  },
  friendItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  friendName: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#000" },
  modalCloseButton: { marginTop: 15, alignSelf: "center" },
});

<<<<<<< HEAD
export default MessagesScreen;
=======
export default MessagesScreen;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
