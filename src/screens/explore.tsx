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
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient";

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
        setLoading(false);
        return;
      }

      const [usersRes, postsRes] = await Promise.all([
        apiClient.get("/users/search", {
          params: { query },
        }),
        apiClient.get("/posts/search", {
          params: { query },
        }),
      ]);

      const usersResults = usersRes.data.map((u: any) => ({ ...u, type: "user" }));
      const postsResults = postsRes.data.map((p: any) => ({
        ...p,
        type: p.is_event ? "event" : "post",
      }));

      const combinedResults = [...usersResults, ...postsResults];
      setSearchResults(combinedResults);
    } catch (error: any) {
      console.error("Error searching:", error.response?.data || error.message);
      setSearchResults([]);
      if (error.code !== "ECONNABORTED" && error.message !== "Network Error") {
        alert("Failed to fetch search results. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => {
        console.log("Clicked search result:", { id: item.id, type: item.type, is_event: item.is_event });
        if (item.type === "user") {
          navigation.navigate("Profile", { userId: item.id });
        } else if (item.type === "event" || item.is_event) {
          navigation.navigate("EventDetails", { eventId: item.id });
        } else {
          navigation.navigate("PostScreen", { postId: item.id });
        }
        setSearchQuery("");
        setSearchResults([]);
      }}
    >
      {item.image || item.profile_picture || item.banner_photo ? (
        <Image
          source={{ uri: item.image || item.profile_picture || item.banner_photo }}
          style={styles.resultImage}
        />
      ) : (
        <View style={styles.resultPlaceholder}>
          <Ionicons name="image-outline" size={24} color="#ccc" />
        </View>
      )}
      <View style={styles.resultDetails}>
        <Text style={styles.resultTitle}>
          {item.type === "user"
            ? `User: ${item.name || item.username || "Unknown"}`
            : `Post: ${item.title || "Untitled"}`}
        </Text>
        {item.type === "event" && item.event_date && (
          <Text style={styles.resultSubtitle}>
            {new Date(item.event_date).toLocaleDateString()}
          </Text>
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for events, profiles, posts..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
      </View>

      {/* Search Results List */}
      {loading ? (
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
    height: 80,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerLeft: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  headerTitle: { 
    fontSize: 23,
    fontFamily: "AirbnbCereal_Md", 
    color: "#333",
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
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
  resultCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  resultImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 10, 
    marginRight: 15 
  },
  resultPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
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
