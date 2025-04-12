import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/header"; // Your provided Header component
import { useTheme } from "../providers/ThemeContext"; // Assuming same theme provider

// Sample communities data
const sampleCommunities = [
  {
    id: "1",
    title: "Faith & Fellowship",
    description: "A community for spiritual growth and connection.",
    members: 120,
    createdAt: new Date("2025-01-15"),
  },
  {
    id: "2",
    title: "Bible Study Group",
    description: "Weekly discussions on scripture and faith.",
    members: 85,
    createdAt: new Date("2024-11-20"),
  },
  {
    id: "3",
    title: "Youth Ministry",
    description: "Engaging young adults in faith-based activities.",
    members: 200,
    createdAt: new Date("2024-09-10"),
  },
  {
    id: "4",
    title: "Prayer Circle",
    description: "Daily prayer sessions for peace and guidance.",
    members: 50,
    createdAt: new Date("2025-03-01"),
  },
];

const CommunitiesScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme(); // Access the current theme
  const styles = createStyles(theme); // Pass the theme to styles
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        setLoading(false);
        return;
      }
      // Simulate API call with sample data
      // In a real app, replace with: const response = await apiClient.get("/communities");
      setTimeout(() => {
        setCommunities(sampleCommunities);
        setLoading(false);
      }, 1000); // Simulate network delay
    } catch (error) {
      console.error("Error fetching communities:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const renderCommunity = ({ item }) => {
    const formattedDate = item.createdAt.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <TouchableOpacity
        style={styles.communityCard}
        onPress={() =>
          navigation.navigate("CommunityDetails", {
            communityId: item.id,
            community: item,
          })
        }
      >
        <Text
          style={[
            styles.communityTitle,
            theme.mode === "blackAndWhite" && { color: "#000" },
          ]}
        >
          {item.title}
        </Text>
        <Text style={styles.communityDescription}>{item.description}</Text>
        <Text style={styles.communityMeta}>
          {item.members} Members • Created {formattedDate}
        </Text>
      </TouchableOpacity>
    );
  };

  let content;
  if (loading) {
    content = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A58CA" />
      </View>
    );
  } else {
    content = communities.length > 0 ? (
      <FlatList
        data={communities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCommunity}
        contentContainerStyle={{
          paddingBottom: 80,
          alignItems: "center",
          paddingHorizontal: 0,
        }}
        style={{ width: "100%", overflow: "visible" }}
      />
    ) : (
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>No Communities Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Header
          title="Communities"
          onBackPress={() => navigation.goBack()}
          rightComponent={
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.editText}>Join</Text>
            </TouchableOpacity>
          }
        />
      </View>
      <View style={styles.communitiesContainer}>{content}</View>
      <TouchableOpacity
        style={[
          styles.exploreButton,
          theme.mode === "blackAndWhite"
            ? { backgroundColor: "#000" }
            : { backgroundColor: theme.primary },
        ]}
        onPress={() => navigation.navigate("Explore")}
      >
        <Text
          style={[
            styles.exploreButtonText,
            theme.mode === "blackAndWhite" ? { color: "#fff" } : { color: "#fff" },
          ]}
        >
          Explore Communities
        </Text>
        {theme.mode !== "blackAndWhite" && (
          <View style={styles.arrowContainer}>
            <Ionicons
              name="arrow-forward"
              size={16}
              style={[styles.arrowIcon, { color: theme.primary }]}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "stretch",
    },
    topContainer: {
      backgroundColor: "#fff",
      paddingBottom: 10,
      zIndex: 1,
      borderBottomWidth: 0,
      borderBottomColor: "transparent",
    },
    communitiesContainer: {
      flex: 1,
      marginTop: 10,
    },
    menuButton: {
      padding: 0,
      backgroundColor: "transparent",
    },
    editText: {
      color: "#000",
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
    },
    contentContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    contentText: {
      fontSize: 18,
      color: "#333",
      marginTop: 20,
      fontFamily: "AirbnbCereal_Md",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    exploreButton: {
      backgroundColor: "#0A58CA",
      paddingVertical: 18,
      borderRadius: 25,
      alignItems: "center",
      marginBottom: 20,
      flexDirection: "row",
      justifyContent: "center",
      position: "absolute",
      bottom: 30,
      left: 20,
      right: 20,
    },
    exploreButtonText: {
      color: "#fff",
      fontSize: 16,
      paddingRight: 0,
      fontFamily: "AirbnbCereal_Md",
    },
    arrowContainer: {
      width: 24,
      height: 24,
      backgroundColor: "#fff",
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
    },
    arrowIcon: {
      color: theme.primary,
    },
    communityCard: {
      width: windowWidth - 40,
      padding: 15,
      borderRadius: 10,
      backgroundColor: "#fff",
      marginBottom: 15,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    communityTitle: {
      fontSize: 16,
      color: "#000",
      marginBottom: 5,
      fontFamily: "AirbnbCereal_Md",
    },
    communityDescription: {
      fontSize: 14,
      color: "#666",
      marginBottom: 5,
      fontFamily: "AirbnbCereal_Lt",
    },
    communityMeta: {
      fontSize: 12,
      color: "#999",
      fontFamily: "AirbnbCereal_Lt",
    },
  });

export default CommunitiesScreen;