import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/header"; // import your Header component
import apiClient from "../api/apiClient";
import { useTheme } from "../providers/ThemeContext"; // Import useTheme

type TabType = "upcoming" | "past" | "rsvp";

const EventsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme(); // Access the current theme
  const styles = createStyles(theme); // Pass the theme to the styles

  const [selectedTab, setSelectedTab] = useState<TabType>("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [rsvpRequests, setRsvpRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRsvp, setLoadingRsvp] = useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        setLoading(false);
        return;
      }
      const [upcomingRes, pastRes] = await Promise.all([
        apiClient.get("/posts/upcoming-events"),
        apiClient.get("/posts/past-events"),
      ]);
      setUpcomingEvents(upcomingRes.data || []);
      setPastEvents(pastRes.data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error.response?.data || error.message);
      Alert.alert("Error", "Unable to fetch events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRsvpRequests = async () => {
    setLoadingRsvp(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        setLoadingRsvp(false);
        return;
      }
      const response = await apiClient.get("/posts/rsvp-requests");
      setRsvpRequests(response.data || []);
    } catch (error: any) {
      console.error("Error fetching RSVP requests:", error.response?.data || error.message);
      Alert.alert("Error", "Unable to fetch RSVP requests.");
    } finally {
      setLoadingRsvp(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedTab === "rsvp") {
      fetchRsvpRequests();
    }
  }, [selectedTab]);

  useEffect(() => {
    AsyncStorage.getItem("currentUserId").then((id) => {
      if (id) setCurrentUserId(id);
    });
  }, []);

  const handleRsvpDecision = async (
    postId: string,
    requesterId: string,
    action: "approve" | "deny"
  ) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      // Make the API call to manage the RSVP
      const response = await apiClient.post(`/posts/${postId}/rsvp/manage`, { userIdToManage: requesterId, action });
      
      // Find the event title from rsvpRequests
      const rsvpRequest = rsvpRequests.find((req) => req.post_id === postId && req.requester_id === requesterId);
      const eventTitle = rsvpRequest?.event_title || "the event";

      // Show confirmation to the event creator and notify them that the requester has been notified
      Alert.alert(
        "Success",
        `RSVP ${action}d successfully! The user has been notified of your decision for "${eventTitle}".`
      );

      // Refresh the RSVP requests list
      fetchRsvpRequests();
    } catch (error: any) {
      console.error("Error managing RSVP:", error.response?.data || error.message);
      Alert.alert("Error", "Could not update RSVP request.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      await apiClient.delete(`/posts/${eventId}`);
      // Remove the event from the respective list:
      setUpcomingEvents((prev) => prev.filter((event) => event.id !== eventId));
      setPastEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (error: any) {
      console.error("Error deleting event:", error.response?.data || error.message);
      Alert.alert("Error", "Could not delete event.");
    }
  };

  const renderEvent = ({ item }: { item: any }) => {
    const isSelected = selectedForDeletion.includes(item.id);
    const eventDate = new Date(item.event_date);
    const formattedDate = eventDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => {
          if (deleteMode) {
            // Toggle selection for deletion
            if (isSelected) {
              setSelectedForDeletion((prev) => prev.filter((id) => id !== item.id));
            } else {
              setSelectedForDeletion((prev) => [...prev, item.id]);
            }
          } else {
            navigation.navigate("EventDetails", { eventId: item.id, event: item });
          }
        }}
      >
        {deleteMode && (
          <Text style={styles.checkbox}>{isSelected ? "[✓]" : "[ ]"}</Text>
        )}
        <Text
          style={[
            styles.eventTitle,
            theme.mode === "blackAndWhite" && { color: "#000" }, // Black text in black-and-white mode
          ]}
        >
          {item.title}
        </Text>
        <Text style={styles.eventDate}>{formattedDate}</Text>
      </TouchableOpacity>
    );
  };

  const renderRsvpRequest = ({ item }: { item: any }) => {
    const eventDate = new Date(item.event_date);
    const formattedDate = eventDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={styles.rsvpCard}>
        <Text style={styles.eventTitle}>{item.event_title}</Text>
        <Text style={styles.eventDate}>{formattedDate}</Text>
        <Text style={styles.requestInfo}>RSVP from {item.requester_username}</Text>
        <View style={styles.rsvpButtonsContainer}>
          <TouchableOpacity
            style={[styles.rsvpButton, styles.approveButton]} // Green approve button
            onPress={() => handleRsvpDecision(item.post_id, item.requester_id, "approve")}
          >
            <Text style={styles.rsvpButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rsvpButton, { backgroundColor: "#FF4444" }]}
            onPress={() => handleRsvpDecision(item.post_id, item.requester_id, "deny")}
          >
            <Text style={styles.rsvpButtonText}>Deny</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    if (selectedTab === "upcoming") {
      content =
        upcomingEvents.length > 0 ? (
          <FlatList
            data={upcomingEvents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEvent}
            contentContainerStyle={{
              paddingBottom: 80,
              alignItems: "center",
              paddingHorizontal: 0,
            }}
            style={{ width: "100%", overflow: "visible" }}
          />
        ) : (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>No Upcoming Events</Text>
          </View>
        );
    } else if (selectedTab === "past") {
      content =
        pastEvents.length > 0 ? (
          <FlatList
            data={pastEvents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEvent}
            contentContainerStyle={{
              paddingBottom: 80,
              alignItems: "center", // Centers the events horizontally
            }}
            style={{ width: "100%", marginHorizontal: 0, overflow: "visible" }}
          />
        ) : (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>No Past Events</Text>
          </View>
        );
    } else if (selectedTab === "rsvp") {
      content =
        loadingRsvp ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0A58CA" />
          </View>
        ) : rsvpRequests.length > 0 ? (
          <FlatList
            data={rsvpRequests}
            keyExtractor={(item) => item.rsvp_id.toString()}
            renderItem={renderRsvpRequest}
            contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 0 }}
            style={{ width: "100%", marginHorizontal: 0, overflow: "visible" }}
          />
        ) : (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>No RSVP Requests</Text>
          </View>
        );
    }
  }

  return (
    <View style={styles.container}>
      {/* White container covering header & tabs area */}
      <View style={styles.topContainer}>
        <Header
          title="Events"
          onBackPress={() => {
            if (deleteMode) {
              // Cancel delete mode on back press
              setDeleteMode(false);
              setSelectedForDeletion([]);
            } else {
              navigation.goBack();
            }
          }}
          rightComponent={
            deleteMode ? (
              <View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => {
                    if (selectedForDeletion.length > 0) {
                      Alert.alert(
                        "Delete Events",
                        `Are you sure you want to delete ${selectedForDeletion.length} event(s)?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            onPress: async () => {
                              for (const eventId of selectedForDeletion) {
                                await handleDeleteEvent(eventId);
                              }
                              setDeleteMode(false);
                              setSelectedForDeletion([]);
                            },
                            style: "destructive",
                          },
                        ]
                      );
                    } else {
                      setDeleteMode(false);
                    }
                  }}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setDeleteMode(false);
                    setSelectedForDeletion([]);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  console.log("Entering edit mode");
                  setDeleteMode(true);
                  setSelectedForDeletion([]);
                }}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            )
          }
        />
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === "upcoming" && styles.activeTab]}
            onPress={() => {
              console.log("Upcoming clicked");
              setSelectedTab("upcoming");
            }}
          >
            <Text style={selectedTab === "upcoming" ? styles.activeTabText : styles.tabText}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === "past" && styles.activeTab]}
            onPress={() => setSelectedTab("past")}
          >
            <Text style={selectedTab === "past" ? styles.activeTabText : styles.tabText}>
              Past
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === "rsvp" && styles.activeTab]}
            onPress={() => setSelectedTab("rsvp")}
          >
            <Text style={selectedTab === "rsvp" ? styles.activeTabText : styles.tabText}>
              RSVP's
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Event list container; events will scroll underneath the white topContainer */}
      <View style={styles.eventsContainer}>{content}</View>

      {/* Explore Events Button */}
      <TouchableOpacity
        style={[
          styles.exploreButton,
          theme.mode === "blackAndWhite"
            ? { backgroundColor: "#000" } // Black button in black-and-white mode
            : { backgroundColor: theme.primary }, // Use theme.primary for light mode
        ]}
        onPress={() => navigation.navigate("Explore")}
      >
        <Text
          style={[
            styles.exploreButtonText,
            theme.mode === "blackAndWhite"
              ? { color: "#fff" } // White text in black-and-white mode
              : { color: "#fff" }, // White text for light mode
          ]}
        >
          Explore Events
        </Text>
        {theme.mode !== "blackAndWhite" && ( // Render arrow only in light mode
          <View style={styles.arrowContainer}>
            <Ionicons
              name="arrow-forward"
              size={16}
              style={[
                styles.arrowIcon,
                { color: theme.primary }, // Light blue arrow for light mode
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "stretch",
    },
    contentWrapper: {
      marginTop: 20, // reduced from 50
      flex: 1,
    },
    menuButton: {
      padding: 0, // Removed padding
      backgroundColor: "transparent", // Ensure no background
    },
    editText: {
      color: "#000", // Black text for Edit
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
    },
    deleteText: {
      color: "red", // Red text for Delete
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
      marginLeft: 0, // Ensure no extra margin
    },
    cancelButton: {
      marginTop: 5, // Positioned below Delete
      padding: 0, // Removed padding
      backgroundColor: "transparent", // Ensure no background
    },
    cancelButtonText: {
      fontSize: 16,
      color: "#000", // Black text for Cancel
      fontFamily: "AirbnbCereal_Md",
      marginLeft: 0, // Ensure no extra margin
    },
    tabContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
      marginBottom: 5,
      backgroundColor: "#f0f0f0",
      borderRadius: 30,
      padding: 3,
      marginHorizontal: 20,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 25,
    },
    tabText: {
      color: "#000", // Changed to black
      fontSize: 16,
      fontFamily: "AirbnbCereal_Md",
    },
    activeTab: {
      backgroundColor: "#fff",
      borderRadius: 25,
    },
    activeTabText: {
      color: "#000", // Changed to black
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
      backgroundColor: "#fff", // White circle
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10, // Space between text and arrow
    },
    arrowIcon: {
      color: theme.primary, // Light blue arrow for light mode
    },
    eventCard: {
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
    eventTitle: {
      fontSize: 16,
      color: "#000", // Changed to black
      marginBottom: 5,
      fontFamily: "AirbnbCereal_Md",
    },
    eventDate: {
      fontSize: 14,
      color: "#333",
      fontFamily: "AirbnbCereal_Lt",
    },
    rsvpCard: {
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
    requestInfo: {
      fontSize: 14,
      color: "#666",
      marginVertical: 5,
      fontFamily: "AirbnbCereal_Lt",
    },
    rsvpButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 10,
    },
    rsvpButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 5,
    },
    rsvpButtonText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "AirbnbCereal_Md",
    },
    approveButton: {
      backgroundColor: "#28a745", // Green for approve button
    },
    topContainer: {
      backgroundColor: "#fff",
      paddingBottom: 10,
      zIndex: 1,
      borderBottomWidth: 0,
      borderBottomColor: "transparent",
    },
    eventsContainer: {
      flex: 1,
      marginTop: 10,
    },
    deleteButton: {
      position: "absolute",
      top: 5,
      right: 5,
    },
    selectionOverlay: {
      position: "absolute",
      top: 5,
      left: 5,
    },
    checkboxContainer: {
      position: "absolute",
      top: 5,
      right: 5,
      width: 24,
      height: 24,
      borderWidth: 1,
      borderColor: "#0A58CA",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 4,
    },
    checkbox: {
      fontSize: 18,
      marginRight: 8,
      color: "#000", // Changed to black
    },
  });

export default EventsScreen;