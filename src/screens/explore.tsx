import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Fuse from "fuse.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

<<<<<<< HEAD
=======
// Default fallback data in case API calls fail – can be empty array
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
const defaultUsers: any[] = [];
const defaultPosts: any[] = [];
const defaultEvents: any[] = [];

const fuseOptionsEvents = {
<<<<<<< HEAD
  keys: ["title", "location"],
=======
  keys: ["title", "location"], // Adjust if your event objects have a "location" field
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  threshold: 0.4,
};

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
=======
  // This function fetches results from three endpoints and combines them.
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
<<<<<<< HEAD
        setLoading(false);
        return;
      }

      const [usersRes, postsRes, eventsRes] = await Promise.all([
        axios.get("http://192.168.1.231:5000/api/users/search", {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://192.168.1.231:5000/api/posts/search", {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://192.168.1.231:5000/api/posts/upcoming-events", {
=======
        return;
      }
      // Execute API calls concurrently
      const [usersRes, postsRes, eventsRes] = await Promise.all([
        axios.get("http://10.0.2.2:5000/api/users/search", {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://10.0.2.2:5000/api/posts/search", {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://10.0.2.2:5000/api/posts/upcoming-events", {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

<<<<<<< HEAD
      const fuse = new Fuse(eventsRes.data || defaultEvents, fuseOptionsEvents);
      const filteredEvents = fuse.search(query).map((result) => result.item);

=======
      // Use Fuse.js to filter events by query – since the events endpoint may not support search parameters
      const fuse = new Fuse(eventsRes.data || defaultEvents, fuseOptionsEvents);
      const filteredEvents = fuse.search(query).map((result) => result.item);

      // Tag results with a type property for later navigation decisions
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      const usersResults = (usersRes.data || defaultUsers).map((u: any) => ({ ...u, type: "user" }));
      const postsResults = (postsRes.data || defaultPosts).map((p: any) => ({ ...p, type: "post" }));
      const eventsResults = filteredEvents.map((e: any) => ({ ...e, type: "event" }));

<<<<<<< HEAD
=======
      // Combine results – you can further sort or filter if needed
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      const combinedResults = [...usersResults, ...postsResults, ...eventsResults];
      setSearchResults(combinedResults);
    } catch (error: any) {
      console.error("Error searching:", error.response?.data || error.message);
<<<<<<< HEAD
      setSearchResults([]);
      if (error.code !== "ECONNABORTED" && error.message !== "Network Error") {
        alert("Failed to fetch search results. Please try again.");
      }
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => {
        if (item.type === "user") {
          navigation.navigate("Profile", { userId: item.id });
        } else if (item.type === "post") {
          navigation.navigate("PostScreen", { postId: item.id });
        } else if (item.type === "event") {
          navigation.navigate("EventDetails", { event: item, fromScreen: "Explore" });
        }
        setSearchQuery("");
        setSearchResults([]);
      }}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.resultImage} />
      ) : (
        <View style={styles.resultPlaceholder}>
          <Ionicons name="image-outline" size={24} color="#ccc" />
        </View>
      )}
      <View style={styles.resultDetails}>
        <Text style={styles.resultTitle}>
          {item.type === "user"
            ? `User: ${item.name || item.username}`
            : item.title || item.event_title}
        </Text>
        {item.type === "event" && (
          <Text style={styles.resultSubtitle}>{item.date || item.event_date}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header — matching other screens */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.headerLeft}
        >
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

=======
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for events, profiles, posts..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch}
<<<<<<< HEAD
          autoCapitalize="none"
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        />
      </View>

      {/* Search Results List */}
      {loading ? (
<<<<<<< HEAD
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#668CFF" />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
          renderItem={renderItem}
          ListEmptyComponent={
            searchQuery.trim().length > 0 ? (
=======
        <ActivityIndicator size="large" color="#668CFF" />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => {
                if (item.type === "user") {
                  navigation.navigate("Profile", { userId: item.id });
                } else if (item.type === "post") {
                  navigation.navigate("PostScreen", { postId: item.id });
                } else if (item.type === "event") {
                  navigation.navigate("EventDetails", { event: item, fromScreen: "Explore" });
                }
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.resultImage} />
              ) : (
                <View style={styles.resultPlaceholder}>
                  <Ionicons name="image-outline" size={24} color="#ccc" />
                </View>
              )}
              <View style={styles.resultDetails}>
                <Text style={styles.resultTitle}>
                  {item.type === "user"
                    ? `User: ${item.name || item.username}`
                    : item.title || item.event_title}
                </Text>
                {item.type === "event" && <Text style={styles.resultSubtitle}>{item.date || item.event_date}</Text>}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && searchQuery.trim().length > 0 ? (
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
              <Text style={styles.emptyText}>No results found</Text>
            ) : null
          }
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    paddingHorizontal: 20, 
    paddingTop: 40 
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    height: 80, // Increased height to lower the elements
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerLeft: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: [{ translateY: -10 }], // Adjust based on icon size
  },
  headerTitle: { 
    fontSize: 23,
    fontFamily: "AirbnbCereal_Md", 
    color: "#333",
    marginTop: 10, // Lower the title
  },
=======
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 40 },
  header: { alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 24, fontFamily: "AirbnbCereal_Md", color: "#000" },
  backButton: { position: "absolute", left: 20, top: 50 },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
<<<<<<< HEAD
    marginTop: 0,  
    marginBottom: 20,
  },
  searchIcon: { 
    marginRight: 10 
  },
  searchInput: { 
    flex: 1, 
    height: 40, 
    fontSize: 16, 
    fontFamily: "AirbnbCereal_Md" 
  },
  resultsList: { 
    paddingBottom: 20,
    marginTop: 20,
  },
=======
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 40, fontSize: 16, fontFamily: "AirbnbCereal_Md" },
  resultsList: { paddingBottom: 20 },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  resultCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
<<<<<<< HEAD
  resultImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 10, 
    marginRight: 15 
  },
=======
  resultImage: { width: 50, height: 50, borderRadius: 10, marginRight: 15 },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  resultPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
<<<<<<< HEAD
  resultDetails: { 
    flex: 1 
  },
  resultTitle: { 
    fontSize: 18, 
    fontFamily: "AirbnbCereal_Md", 
    color: "#333" 
  },
  resultSubtitle: { 
    fontSize: 14, 
    fontFamily: "AirbnbCereal_Lt", 
    color: "#888" 
  },
  emptyText: { 
    textAlign: "center", 
    color: "#999", 
    marginTop: 20, 
    fontFamily: "AirbnbCereal_Md" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});

export default ExploreScreen;
=======
  resultDetails: { flex: 1 },
  resultTitle: { fontSize: 18, fontFamily: "AirbnbCereal_Md", color: "#333" },
  resultSubtitle: { fontSize: 14, fontFamily: "AirbnbCereal_Lt", color: "#888" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 20 },
});

export default ExploreScreen;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
