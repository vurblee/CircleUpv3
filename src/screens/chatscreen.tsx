import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
<<<<<<< HEAD
  Keyboard,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
=======
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
<<<<<<< HEAD
import Header from "../components/header"; // import the reusable header
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface User {
  id: string;
  username: string;
}

interface RouteParams {
<<<<<<< HEAD
  conversationId?: string;
=======
  conversationId?: string; // may be undefined if new conversation
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  partnerId: string;
  partnerName?: string;
}

<<<<<<< HEAD
=======
// Helper function to validate UUID strings
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

<<<<<<< HEAD
const DEFAULT_INPUT_MARGIN_BOTTOM = 50;

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
=======
const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const { conversationId: convIdFromParams, partnerId, partnerName } = route.params as RouteParams;
  const [conversationId, setConversationId] = useState<string>(convIdFromParams || "");
  const [friendName, setFriendName] = useState<string>(partnerName || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingUser, setLoadingUser] = useState<boolean>(!partnerName);

<<<<<<< HEAD
  // Create an Animated value for the input container's bottom position
  const [inputBottom] = useState(new Animated.Value(DEFAULT_INPUT_MARGIN_BOTTOM));

  // Update the inputBottom animated value when keyboard appears/disappears
  useEffect(() => {
    const onKeyboardShow = (e: any) => {
      const duration = e.duration || 250;
      const keyboardHeight = e.endCoordinates ? e.endCoordinates.height : 0;
      Animated.timing(inputBottom, {
        toValue: DEFAULT_INPUT_MARGIN_BOTTOM + keyboardHeight,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const onKeyboardHide = () => {
      // Use a fixed duration since e.duration might be undefined
      Animated.timing(inputBottom, {
        toValue: DEFAULT_INPUT_MARGIN_BOTTOM,
        duration: 250,
        useNativeDriver: false,
      }).start();
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      onKeyboardShow
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      onKeyboardHide
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [inputBottom]);

=======
  // Create a new conversation and return its ID.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const createConversation = async (): Promise<string | null> => {
    if (!partnerId || typeof partnerId !== "string" || partnerId.trim() === "") {
      console.error("Invalid partnerId.");
      Alert.alert("Error", "A valid partner ID is required.");
      return null;
    }
<<<<<<< HEAD
=======
    // Validate that partnerId is a proper UUID.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    if (!isValidUuid(partnerId)) {
      console.error("Invalid partnerId format. Expected a UUID but got:", partnerId);
      Alert.alert("Error", "Partner ID is invalid. Please contact support.");
      return null;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      if (!token) {
        navigation.navigate("SignIn");
        return null;
      }
      const response = await axios.post(
        "http://192.168.1.231:5000/api/conversations",
        { partnerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
=======
      const response = await axios.post(
        "http://10.0.2.2:5000/api/conversations",
        { partnerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Conversation creation response:", response.data);
      // Use conversation_id if available, else fallback to id.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      const convId = response.data.conversation_id || response.data.id;
      if (!convId) {
        console.error("No conversation ID returned from server.");
        Alert.alert("Error", "Conversation ID not returned.");
        return null;
      }
      setConversationId(convId);
      return convId;
<<<<<<< HEAD
    } catch (error: any) {
      console.error("Error creating conversation:", error.response?.data || error.message);
=======
    } catch (error) {
      console.error("Error creating conversation:", error);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      Alert.alert("Error", "Could not create conversation.");
      return null;
    }
  };

<<<<<<< HEAD
  const fetchPartnerInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        setLoadingUser(false);
        return;
      }
      const response = await axios.get(`http://192.168.1.231:5000/api/users/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user: User = response.data;
      setFriendName(user.username || "Unknown User");
    } catch (error: any) {
      console.error("Error fetching partner info:", error.response?.data || error.message);
      setFriendName("Unknown User");
=======
  // Fetch partner info if partnerName is not provided.
  const fetchPartnerInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`http://10.0.2.2:5000/api/users/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user: User = response.data;
      setFriendName(user.username);
    } catch (error) {
      console.error("Error fetching partner info:", error);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    } finally {
      setLoadingUser(false);
    }
  };

<<<<<<< HEAD
=======
  // Fetch messages for the conversation.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      if (!token) {
        navigation.navigate("SignIn");
        setLoading(false);
        return;
      }
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      if (!conversationId) {
        setMessages([]);
        return;
      }
      const response = await axios.get(
<<<<<<< HEAD
        `http://192.168.1.231:5000/api/messages/conversation/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn("Conversation not found. Treating as empty conversation.");
        setMessages([]);
      } else {
        console.error("Error fetching messages:", error.response?.data || error.message);
=======
        `http://10.0.2.2:5000/api/messages/conversation/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Fetched messages:", response.data);
      setMessages(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.warn("Conversation not found. Treating as empty conversation.");
        setMessages([]);
      } else {
        console.error("Error fetching messages:", error);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        Alert.alert("Error", "Could not fetch messages.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    const initializeChat = async () => {
      if (!partnerName) {
        await fetchPartnerInfo();
      }
      if (!conversationId) {
        const newConvId = await createConversation();
        if (newConvId) {
          await fetchMessages();
        }
      } else {
        await fetchMessages();
      }
    };
    initializeChat();
  }, [conversationId, partnerId, partnerName]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
=======
    if (!partnerName) {
      fetchPartnerInfo();
    }
    if (!conversationId) {
      createConversation().then((newConvId) => {
        if (newConvId) {
          fetchMessages();
        }
      });
    } else {
      fetchMessages();
    }
  }, [conversationId]);

  // Send a new message.
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    // Optional: Validate partnerId again before sending message.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    if (!isValidUuid(partnerId)) {
      console.error("Invalid partnerId format when sending message:", partnerId);
      Alert.alert("Error", "Partner ID is invalid. Please contact support.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
<<<<<<< HEAD
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation();
        if (!convId) return;
      }
      const payload = { conversation_id: convId, receiver_id: partnerId, content: inputText };
      await axios.post("http://192.168.1.231:5000/api/messages", payload, {
=======
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation();
        if (!convId) {
          return;
        }
      }
      const payload = { conversation_id: convId, receiver_id: partnerId, content: inputText };
      console.log("Sending payload:", payload);
      await axios.post("http://10.0.2.2:5000/api/messages", payload, {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        headers: { Authorization: `Bearer ${token}` },
      });
      setInputText("");
      fetchMessages();
<<<<<<< HEAD
    } catch (error: any) {
      console.error("Error sending message:", error.response?.data || error.message);
=======
    } catch (error) {
      console.error("Error sending message:", error);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      Alert.alert("Error", "Could not send message.");
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isPartnerMessage = item.sender_id === partnerId;
    return (
      <View
        style={[
          styles.messageBubble,
          isPartnerMessage ? styles.partnerBubble : styles.myBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
<<<<<<< HEAD
      keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
    >
      {/* Reusable Header */}
      <Header title={`Chat with ${friendName}`} onBackPress={() => navigation.goBack()} />

      {/* Chat messages area */}
      <View style={styles.messagesArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#668CFF" />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No previous messages. Start a new conversation!
            </Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.chatContainer}
          />
        )}
      </View>

      {/* Animated Input Area */}
      <Animated.View style={[styles.inputContainer, { bottom: inputBottom }]}>
=======
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        {loadingUser ? (
          <ActivityIndicator size="small" color="#668CFF" />
        ) : (
          <Text style={styles.headerTitle}>Chat with {friendName}</Text>
        )}
      </View>

      {/* Chat Messages */}
      {loading ? (
        <ActivityIndicator size="large" color="#668CFF" style={{ marginTop: 20 }} />
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No previous messages. Start a new conversation!</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContainer}
        />
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#888"
<<<<<<< HEAD
          multiline
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
<<<<<<< HEAD
      </Animated.View>
=======
      </View>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  messagesArea: {
    flex: 1,  
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  chatContainer: { 
    padding: 10, 
    paddingBottom: 20,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  emptyText: { 
    fontSize: 16, 
    color: "#888", 
    textAlign: "center", 
    fontFamily: "AirbnbCereal_Md" 
  },
  // Make the input container position absolute
  inputContainer: {
    position: "absolute",
    left: 0,
    right: 0,
=======
  container: { flex: 1, backgroundColor: "#fff" },
  safeArea: { flex: 1, paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingHorizontal: 10,
  },
  backButton: { position: "absolute", left: 15 },
  headerTitle: { fontSize: 20, fontFamily: "AirbnbCereal_Md", color: "#000" },
  chatContainer: { padding: 10, paddingBottom: 80 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#888", textAlign: "center" },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  myBubble: { backgroundColor: "#0D6EFD", alignSelf: "flex-end" },
  partnerBubble: { backgroundColor: "#eee", alignSelf: "flex-start" },
  messageText: { fontSize: 16, color: "#000", fontFamily: "AirbnbCereal_Md" },
  messageTime: { fontSize: 10, color: "#888", marginTop: 5, textAlign: "right" },
  inputContainer: {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    padding: 10,
    alignItems: "center",
<<<<<<< HEAD
=======
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontFamily: "AirbnbCereal_Md",
    color: "#000",
    marginRight: 10,
<<<<<<< HEAD
    maxHeight: 100,
  },
  sendButton: { 
    backgroundColor: "#0A58CA", 
    padding: 10, 
    borderRadius: 20 
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  myBubble: { 
    backgroundColor: "#0D6EFD", 
    alignSelf: "flex-end" 
  },
  partnerBubble: { 
    backgroundColor: "#eee", 
    alignSelf: "flex-start" 
  },
  messageText: { 
    fontSize: 16, 
    color: "#000", 
    fontFamily: "AirbnbCereal_Md" 
  },
  messageTime: { 
    fontSize: 10, 
    color: "#888", 
    marginTop: 5, 
    textAlign: "right", 
    fontFamily: "AirbnbCereal_Lt" 
  },
});

export default ChatScreen;
=======
  },
  sendButton: { backgroundColor: "#0A58CA", padding: 10, borderRadius: 20 },
});

export default ChatScreen;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
