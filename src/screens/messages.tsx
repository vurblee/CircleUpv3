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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/header";
import apiClient from "../api/apiClient";
import { useTheme } from "../providers/ThemeContext"; // Import useTheme

const { width, height } = Dimensions.get("window");

interface Conversation {
  conversation_id: string;
  last_updated: string;
  partner_id: string;
  friend_username?: string;
  friend_online?: boolean;
}

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  name?: string;
  friend_username?: string;
  username?: string;
  profile_picture?: string;
}

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme(); // Access the current theme
  const styles = createStyles(theme); // Pass the theme to the styles

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([]);
  const [activeTab, setActiveTab] = useState<"current" | "deleted">("current");
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedConvos, setSelectedConvos] = useState<Set<string>>(new Set());
  const [newChatModalVisible, setNewChatModalVisible] = useState<boolean>(false);
  const [friendSearchText, setFriendSearchText] = useState<string>("");
  const [friendsList, setFriendsList] = useState<Friend[]>([]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/conversations");
      const apiConversations = (response.data || []) as Conversation[];

      // Load deleted conversations from AsyncStorage
      const savedDeletedConversations = await AsyncStorage.getItem("deletedConversations");
      const deletedConvos = savedDeletedConversations ? JSON.parse(savedDeletedConversations) : [];

      // Filter out deleted conversations from the API response
      const currentConvos = apiConversations.filter(
        (conv: Conversation) =>
          !deletedConvos.some((del: Conversation) => del.conversation_id === conv.conversation_id)
      );

      // Ensure only one active conversation per user (partner_id)
      const uniqueConversations = Object.values(
        currentConvos.reduce((acc, conv) => {
          if (!acc[conv.partner_id] || new Date(conv.last_updated) > new Date(acc[conv.partner_id].last_updated)) {
            acc[conv.partner_id] = conv; // Keep the most recent conversation
          }
          return acc;
        }, {} as Record<string, Conversation>)
      );

      setConversations(uniqueConversations);
      setDeletedConversations(deletedConvos);
    } catch (error: any) {
      console.error("Error fetching conversations:", error.response?.data || error.message);
      Alert.alert("Error", "Unable to fetch conversations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await apiClient.get("/friends");
      setFriendsList(response.data || []);
    } catch (error: any) {
      console.error("Error fetching friends list:", error.response?.data || error.message);
      setFriendsList([]);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchConversations(), fetchFriends()]);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  const openNewChatModal = async () => {
    await fetchFriends(); // Refresh friends list when opening modal
    setNewChatModalVisible(true);
  };

  const filteredFriends = friendsList.filter((friend) =>
    (friend.name ||
      friend.friend_username ||
      friend.username ||
      `User ${friend.friend_id || friend.user_id}`)
      .toLowerCase()
      .includes(friendSearchText.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateStr).toLocaleTimeString([], options);
  };

  const getUsernameFromId = (id: string): string => {
    const friend = friendsList.find((f) => String(f.friend_id || f.user_id) === id);
    return friend?.name || friend?.friend_username || friend?.username || `User ${id}`;
  };

  const getPartnerProfilePicture = (partnerId: string): string => {
    const friend = friendsList.find(
      (f) => String(f.friend_id || f.user_id || f.id) === String(partnerId)
    );
    return friend && friend.profile_picture
      ? friend.profile_picture
      : "https://via.placeholder.com/50";
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const displayName = item.friend_username || getUsernameFromId(item.partner_id);
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
              partnerId: item.partner_id,
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
        {editMode && <Text style={styles.checkbox}>{isSelected ? "[✓]" : "[ ]"}</Text>}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: getPartnerProfilePicture(item.partner_id) }}
            style={styles.profilePic}
          />
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

  const handleCurrentDelete = async () => {
    Alert.alert(
      "Delete Conversations",
      "Are you sure you want to delete the selected conversations?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const toDelete = conversations.filter((conv) =>
              selectedConvos.has(conv.conversation_id)
            );
            const updatedDeletedConversations = [...toDelete, ...deletedConversations];
            const updatedConversations = conversations.filter(
              (conv) => !selectedConvos.has(conv.conversation_id)
            );

            // Update state
            setDeletedConversations(updatedDeletedConversations);
            setConversations(updatedConversations);
            setSelectedConvos(new Set());
            setEditMode(false);

            // Save to AsyncStorage
            try {
              await AsyncStorage.setItem(
                "deletedConversations",
                JSON.stringify(updatedDeletedConversations)
              );
            } catch (error) {
              console.error("Error saving deleted conversations:", error);
            }
          },
        },
      ]
    );
  };

  const handleRecover = async () => {
    Alert.alert(
      "Recover Conversations",
      "Are you sure you want to recover the selected conversations?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Recover",
          onPress: async () => {
            const recovered = deletedConversations.filter((conv) =>
              selectedConvos.has(conv.conversation_id)
            );
            const updatedDeletedConversations = deletedConversations.filter(
              (conv) => !selectedConvos.has(conv.conversation_id)
            );

            // Update state
            setConversations([...recovered, ...conversations]);
            setDeletedConversations(updatedDeletedConversations);
            setSelectedConvos(new Set());
            setEditMode(false);

            // Save to AsyncStorage
            try {
              await AsyncStorage.setItem(
                "deletedConversations",
                JSON.stringify(updatedDeletedConversations)
              );
            } catch (error) {
              console.error("Error saving deleted conversations:", error);
            }
          },
        },
      ]
    );
  };

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
            const convsToDelete = deletedConversations.filter((conv) =>
              selectedConvos.has(conv.conversation_id)
            );
            const updatedDeletedConversations = deletedConversations.filter(
              (conv) => !selectedConvos.has(conv.conversation_id)
            );

            // Perform API deletion
            for (const conv of convsToDelete) {
              try {
                await apiClient.delete(`/conversations/${conv.conversation_id}/permanent`);
              } catch (err: any) {
                if (err.response?.status === 404) {
                  console.warn(
                    `Conversation ${conv.conversation_id} not found, skipping deletion.`
                  );
                } else {
                  console.error(
                    "Error permanently deleting conversation:",
                    err.response?.data || err.message
                  );
                }
              }
            }

            // Update state
            setDeletedConversations(updatedDeletedConversations);
            setSelectedConvos(new Set());
            setEditMode(false);

            // Save to AsyncStorage
            try {
              await AsyncStorage.setItem(
                "deletedConversations",
                JSON.stringify(updatedDeletedConversations)
              );
            } catch (error) {
              console.error("Error saving deleted conversations:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Messages"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          editMode ? (
            <View style={styles.headerColumnContainerLeft}>
              {activeTab === "current" ? (
                <>
                  <TouchableOpacity style={styles.headerButton} onPress={handleCurrentDelete}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => {
                      setEditMode(false);
                      setSelectedConvos(new Set());
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.headerButton} onPress={handleRecover}>
                    <Text style={styles.headerButtonText}>Recover</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerButton} onPress={handlePermanentDelete}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => {
                      setEditMode(false);
                      setSelectedConvos(new Set());
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
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
      />

      <View style={styles.contentWrapper}>
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

        {loading ? (
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
          />
        ) : (
          <FlatList
            data={deletedConversations}
            keyExtractor={(item) => item.conversation_id}
            renderItem={renderConversation}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No deleted conversations.</Text>}
          />
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.chatButton,
          theme.mode === "blackAndWhite" && { backgroundColor: "#000" }, // Black button in black-and-white mode
        ]}
        onPress={openNewChatModal}
      >
        <Text
          style={[
            styles.chatButtonText,
            theme.mode === "blackAndWhite" && { color: "#fff" }, // White text in black-and-white mode
          ]}
        >
          Start a Chat
        </Text>
        <Ionicons
          name="arrow-forward"
          size={16}
          color={theme.mode === "blackAndWhite" ? "#fff" : "#fff"} // Icon color remains white
        />
      </TouchableOpacity>

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
              keyExtractor={(item) =>
              String(item.friend_id || item.user_id || item.id)
              }
              renderItem={({ item }) => {
                const partnerId = item.id || item.friend_id || item.user_id;
                if (!partnerId) {
                  Alert.alert("Error", "Cannot start chat without a valid partner ID.");
                  return null;
                }
                const displayName =
                  item.name || item.friend_username || item.username || `User ${partnerId}`;
                return (
                  <TouchableOpacity
                    style={styles.friendItem}
                    onPress={() => {
                      setNewChatModalVisible(false);
                      navigation.navigate("ChatScreen", {
                        partnerId: String(partnerId),
                        partnerName: displayName,
                      });
                    }}
                  >
                    <Image
                      source={{
                        uri: item.profile_picture
                          ? item.profile_picture
                          : "https://via.placeholder.com/50",
                      }}
                      style={styles.friendPic}
                    />
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

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    headerColumnContainerLeft: {
      flexDirection: "column",
      alignItems: "flex-start",
      marginLeft: -20,
    },
    headerButton: {
      paddingVertical: 5,
      marginVertical: 2,
      paddingHorizontal: 5,
    },
    headerButtonText: {
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
      color: "#000", // Always black for the Edit button
      flexShrink: 0,
    },
    deleteButtonText: {
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
      color: "red", // Red for Delete
    },
    cancelButtonText: {
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
      color: theme.mode === "blackAndWhite" ? "#000" : "#000", // Black for Cancel
    },
    contentWrapper: { marginTop: 20, flex: 1 },
    tabContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 5,
      backgroundColor: "#f0f0f0",
      borderRadius: 30,
      marginHorizontal: 20,
      padding: 3,
    },
    tabButton: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 25 },
    tabText: { color: "#888", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
    activeTab: { backgroundColor: "#fff" },
    activeTabText: { color: "#000", fontSize: 16, fontFamily: "AirbnbCereal_Md" },
    listContainer: { paddingHorizontal: 0, paddingBottom: 50 },
    emptyText: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 16,
      color: "#888",
      fontFamily: "AirbnbCereal_Lt",
    },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    conversationItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      width: "100%",
    },
    profileContainer: { position: "relative", marginRight: 10 },
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
    conversationContent: {
      flex: 1,
      marginLeft: 10,
      marginHorizontal: 10,
    },
    conversationName: { fontSize: 16, fontFamily: "AirbnbCereal_Md", color: "#000" },
    conversationPreview: { fontSize: 14, fontFamily: "AirbnbCereal_Lt", color: "#888" },
    conversationTime: { fontSize: 12, fontFamily: "AirbnbCereal_Lt", color: "#888", paddingRight: 10 },
    checkbox: {
      fontSize: 18,
      marginRight: 8,
      color: theme.mode === "blackAndWhite" ? "#000" : "#000", // Black for [ ] in all modes
    },
    chatButton: {
      position: "absolute",
      bottom: 40,
      left: "20%",
      right: "20%",
      backgroundColor: theme.primary, // Default theme color
      paddingVertical: 15,
      borderRadius: 25,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    chatButtonText: {
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
      color: "#fff", // Default text color
      marginRight: 5,
    },
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
    modalTitle: { fontSize: 20, fontFamily: "AirbnbCereal_Md", color: "#000", textAlign: "center" },
    searchInput: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 10,
      padding: 10,
      marginVertical: 15,
      fontFamily: "AirbnbCereal_Md",
      color: "#000",
    },
    friendItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      paddingHorizontal: 10,
    },
    friendPic: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    friendName: {
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
      color: "#000",
      marginLeft: 10,
    },
    modalCloseButton: { marginTop: 15, alignSelf: "center" },
  });

export default MessagesScreen;