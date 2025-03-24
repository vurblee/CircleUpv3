import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
<<<<<<< HEAD
  Dimensions,
  StatusBar,
  Platform,
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
<<<<<<< HEAD
import Header from "../components/header"; // import your Header component
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

type TabType = "upcoming" | "past" | "rsvp";

const EventsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedTab, setSelectedTab] = useState<TabType>("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [rsvpRequests, setRsvpRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRsvp, setLoadingRsvp] = useState<boolean>(false);
<<<<<<< HEAD
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
<<<<<<< HEAD
        setLoading(false);
        return;
      }
      const [upcomingRes, pastRes] = await Promise.all([
        axios.get("http://192.168.1.231:5000/api/posts/upcoming-events", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://192.168.1.231:5000/api/posts/past-events", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUpcomingEvents(upcomingRes.data || []);
      setPastEvents(pastRes.data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error.response?.data || error.message);
      Alert.alert("Error", "Unable to fetch events. Please try again.");
=======
        return;
      }
      // Fetch upcoming events
      const upcomingRes = await axios.get("http://10.0.2.2:5000/api/posts/upcoming-events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingEvents(upcomingRes.data);

      // Fetch past events
      const pastRes = await axios.get("http://10.0.2.2:5000/api/posts/past-events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPastEvents(pastRes.data);
    } catch (error: any) {
      console.error("Error fetching events:", error.response?.data || error.message);
      Alert.alert("Error", "Unable to fetch events.");
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
<<<<<<< HEAD
        setLoadingRsvp(false);
        return;
      }
      const response = await axios.get("http://192.168.1.231:5000/api/posts/rsvp-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRsvpRequests(response.data || []);
=======
        return;
      }
      const response = await axios.get("http://10.0.2.2:5000/api/posts/rsvp-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRsvpRequests(response.data);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    } catch (error: any) {
      console.error("Error fetching RSVP requests:", error.response?.data || error.message);
      Alert.alert("Error", "Unable to fetch RSVP requests.");
    } finally {
      setLoadingRsvp(false);
    }
  };

  useEffect(() => {
    fetchEvents();
<<<<<<< HEAD
  }, []);

  useEffect(() => {
=======
    // If the RSVP tab is selected, fetch RSVP requests
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    if (selectedTab === "rsvp") {
      fetchRsvpRequests();
    }
  }, [selectedTab]);

<<<<<<< HEAD
  useEffect(() => {
    AsyncStorage.getItem("currentUserId").then((id) => {
      if (id) setCurrentUserId(id);
    });
  }, []);

  const handleRsvpDecision = async (postId: string, requesterId: string, action: "approve" | "deny") => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      await axios.post(
        `http://192.168.1.231:5000/api/posts/${postId}/rsvp/manage`,
=======
  const handleRsvpDecision = async (postId: string, requesterId: string, action: "approve" | "deny") => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `http://10.0.2.2:5000/api/posts/${postId}/rsvp/manage`,
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        { userIdToManage: requesterId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", `RSVP ${action}d successfully!`);
<<<<<<< HEAD
=======
      // Refresh RSVP requests list
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      fetchRsvpRequests();
    } catch (error: any) {
      console.error("Error managing RSVP:", error.response?.data || error.message);
      Alert.alert("Error", "Could not update RSVP request.");
    }
  };

<<<<<<< HEAD
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.navigate("SignIn");
        return;
      }
      await axios.delete(`http://192.168.1.231:5000/api/posts/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove the event from the respective list:
      setUpcomingEvents(prev => prev.filter(event => event.id !== eventId));
      setPastEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error: any) {
      console.error("Error deleting event:", error.response?.data || error.message);
      Alert.alert("Error", "Could not delete event.");
    }
  };

  const renderEvent = ({ item }: { item: any }) => {
    const isSelected = selectedForDeletion.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => {
          if (deleteMode) {
            // Toggle selection for deletion
            if (isSelected) {
              setSelectedForDeletion((prev) =>
                prev.filter((id) => id !== item.id)
              );
            } else {
              setSelectedForDeletion((prev) => [...prev, item.id]);
            }
          } else {
            navigation.navigate("EventDetails", { eventId: item.id, event: item });
          }
        }}
      >
        {deleteMode && (
          <Text style={styles.checkbox}>
            {isSelected ? "[✓]" : "[ ]"}
          </Text>
        )}
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>{item.event_date}</Text>
      </TouchableOpacity>
    );
  };
=======
  const renderEvent = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate("EventDetails", { eventId: item.id, event: item })}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDate}>{item.event_date}</Text>
      {/* Additional event details can be added here */}
    </TouchableOpacity>
  );
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

  const renderRsvpRequest = ({ item }: { item: any }) => (
    <View style={styles.rsvpCard}>
      <Text style={styles.eventTitle}>{item.event_title}</Text>
      <Text style={styles.eventDate}>{item.event_date}</Text>
      <Text style={styles.requestInfo}>
        RSVP from {item.requester_username}
      </Text>
      <View style={styles.rsvpButtonsContainer}>
        <TouchableOpacity
          style={[styles.rsvpButton, { backgroundColor: "#0A58CA" }]}
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

  let content;
  if (loading) {
<<<<<<< HEAD
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
            contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 0 }}
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
=======
    content = <ActivityIndicator size="large" color="#0A58CA" />;
  } else {
    if (selectedTab === "upcoming") {
      content = upcomingEvents.length > 0 ? (
        <FlatList
          data={upcomingEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEvent}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>No Upcoming Events</Text>
        </View>
      );
    } else if (selectedTab === "past") {
      content = pastEvents.length > 0 ? (
        <FlatList
          data={pastEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEvent}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>No Past Events</Text>
        </View>
      );
    } else if (selectedTab === "rsvp") {
      content = loadingRsvp ? (
        <ActivityIndicator size="large" color="#0A58CA" />
      ) : rsvpRequests.length > 0 ? (
        <FlatList
          data={rsvpRequests}
          keyExtractor={(item) => item.rsvp_id.toString()}
          renderItem={renderRsvpRequest}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>No RSVP Requests</Text>
        </View>
      );
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  }

  return (
    <View style={styles.container}>
<<<<<<< HEAD
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
                    // If nothing is selected, simply exit delete mode
                    setDeleteMode(false);
                  }
                }}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
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
      <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate("Explore")}>
=======
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.headerTitle}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "upcoming" && styles.activeTab]}
          onPress={() => setSelectedTab("upcoming")}
        >
          <Text style={selectedTab === "upcoming" ? styles.activeTabText : styles.tabText}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "past" && styles.activeTab]}
          onPress={() => setSelectedTab("past")}
        >
          <Text style={selectedTab === "past" ? styles.activeTabText : styles.tabText}>Past</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "rsvp" && styles.activeTab]}
          onPress={() => setSelectedTab("rsvp")}
        >
          <Text style={selectedTab === "rsvp" ? styles.activeTabText : styles.tabText}>RSVP Requests</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {content}

      {/* Explore Events Button */}
      <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate("Home")}>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        <Text style={styles.exploreButtonText}>Explore Events</Text>
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={16} color="#669dff" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

<<<<<<< HEAD
const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
  },
  contentWrapper: {
    marginTop: 20, // reduced from 50
    flex: 1,
  },
  menuButton: { padding: 5 },
  editText: {
    color: "#0A58CA",
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
  deleteText: {
    color: "red",
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    marginLeft: 15,
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
    color: "#888", 
    fontSize: 16, 
    fontFamily: "AirbnbCereal_Md" 
  },
  activeTab: { 
    backgroundColor: "#fff", 
    borderRadius: 25 
  },
  activeTabText: { 
    color: "#0A58CA", 
    fontSize: 16, 
    fontFamily: "AirbnbCereal_Md" 
  },
  contentContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  contentText: {
    fontSize: 18,
    color: "#333",
    marginTop: 20,
    fontFamily: "AirbnbCereal_Md",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
=======
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 18, marginLeft: 10, color: "#000" },
  menuButton: { padding: 5 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
    padding: 2,
  },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 25 },
  tabText: { color: "#888", fontSize: 16 },
  activeTab: { backgroundColor: "#fff", borderRadius: 25 },
  activeTabText: { color: "#0A58CA", fontSize: 16 },
  contentContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  contentText: { fontSize: 18, color: "#333", marginTop: 20 },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  exploreButton: {
    backgroundColor: "#0A58CA",
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
<<<<<<< HEAD
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  exploreButtonText: { color: "#fff", fontSize: 16, marginRight: 10, fontFamily: "AirbnbCereal_Md" },
=======
  },
  exploreButtonText: { color: "#fff", fontSize: 16, marginRight: 10 },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  arrowContainer: {
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 15,
  },
  eventCard: {
<<<<<<< HEAD
    width: windowWidth - 40,
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
<<<<<<< HEAD
  eventTitle: { fontSize: 16, color: "#0A58CA", marginBottom: 5, fontFamily: "AirbnbCereal_Md" },
  eventDate: { fontSize: 14, color: "#333", fontFamily: "AirbnbCereal_Lt" },
=======
  eventTitle: { fontSize: 16, color: "#0A58CA", marginBottom: 5 },
  eventDate: { fontSize: 14, color: "#333" },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
<<<<<<< HEAD
  requestInfo: {
    fontSize: 14,
    color: "#666",
    marginVertical: 5,
    fontFamily: "AirbnbCereal_Lt",
  },
  rsvpButtonsContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  rsvpButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  rsvpButtonText: { color: "#fff", fontSize: 14, fontFamily: "AirbnbCereal_Md" },
  topContainer: {
    backgroundColor: "#fff",
    paddingBottom: 10,
    zIndex: 1,
    borderBottomWidth: 0, // Ensure no border properties are present
    borderBottomColor: "transparent", // Ensure no border properties are present
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
    color: "#0A58CA",
  },
});

export default EventsScreen;
=======
  requestInfo: { fontSize: 14, color: "#666", marginVertical: 5 },
  rsvpButtonsContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  rsvpButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  rsvpButtonText: { color: "#fff", fontSize: 14 },
});

export default EventsScreen;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
