import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";
import { useRoute, useNavigation } from "@react-navigation/native";
import Header from "../components/header";

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
  conversationId?: string;
  partnerId?: string; // Make optional to handle missing cases
  partnerName?: string;
}

const isValidUuid = (id: string | undefined): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const DEFAULT_INPUT_MARGIN_BOTTOM = 50;

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { conversationId: convIdFromParams, partnerId, partnerName } = route.params as RouteParams;
  const [conversationId, setConversationId] = useState<string>(convIdFromParams || "");
  const [friendName, setFriendName] = useState<string>(partnerName || "Unknown User");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingUser, setLoadingUser] = useState<boolean>(!partnerName && !!partnerId);

  const [inputBottom] = useState(new Animated.Value(DEFAULT_INPUT_MARGIN_BOTTOM));

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

  const createConversation = async (): Promise<string | null> => {
    if (!partnerId || !isValidUuid(partnerId)) {
      console.error("Invalid partnerId:", partnerId);
      Alert.alert("Error", "A valid partner ID is required to start a conversation.");
      return null;
    }
    try {
      const response = await apiClient.post("/conversations", { partnerId });
      const convId = response.data.conversation_id || response.data.id;
      if (!convId) {
        console.error("No conversation ID returned from server.");
        Alert.alert("Error", "Conversation ID not returned.");
        return null;
      }
      setConversationId(convId);
      return convId;
    } catch (error: any) {
      console.error("Error creating conversation:", error.response?.data || error.message);
      Alert.alert("Error", "Could not create conversation.");
      return null;
    }
  };

  const fetchPartnerInfo = async () => {
    if (!partnerId || !isValidUuid(partnerId)) {
      console.error("Cannot fetch partner info: Invalid partnerId:", partnerId);
      setFriendName("Unknown User");
      setLoadingUser(false);
      return;
    }
    try {
      const response = await apiClient.get(`/users/${partnerId}`);
      const user: User = response.data;
      setFriendName(user.username || "Unknown User");
    } catch (error: any) {
      console.error("Error fetching partner info:", error.response?.data || error.message);
      setFriendName("Unknown User");
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      if (!conversationId) {
        setMessages([]);
        return;
      }
      const response = await apiClient.get(`/messages/conversation/${conversationId}`);
      setMessages(response.data || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn("Conversation not found. Treating as empty conversation.");
        setMessages([]);
      } else {
        console.error("Error fetching messages:", error.response?.data || error.message);
        Alert.alert("Error", "Could not fetch messages.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      if (!partnerId) {
        console.error("partnerId is missing in route params:", route.params);
        Alert.alert("Error", "Cannot open chat: Partner ID is missing.");
        setLoading(false);
        return;
      }
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
    if (!partnerId || !isValidUuid(partnerId)) {
      console.error("Invalid partnerId format when sending message:", partnerId);
      Alert.alert("Error", "Partner ID is invalid. Please contact support.");
      return;
    }
    try {
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation();
        if (!convId) return;
      }
      const payload = { conversation_id: convId, receiver_id: partnerId, content: inputText };
      await apiClient.post("/messages", payload);
      setInputText("");
      fetchMessages();
    } catch (error: any) {
      console.error("Error sending message:", error.response?.data || error.message);
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

  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#668CFF" />
        <Text style={styles.emptyText}>Loading user info...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
    >
      <Header title={`Chat with ${friendName}`} onBackPress={() => navigation.goBack()} />
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
      <Animated.View style={[styles.inputContainer, { bottom: inputBottom }]}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
  inputContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    padding: 10,
    alignItems: "center",
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