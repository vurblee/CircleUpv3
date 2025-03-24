import React from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import HapticButton from "../components/hapticbutton";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const EditPostScreen = ({ route, navigation }) => {
  const { post } = route.params;

  const handleDelete = async () => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this post/event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            await axios.delete(`http://192.168.1.231:5000/api/posts/${post.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Success", "Post/Event deleted successfully!");
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting post:", error);
            Alert.alert("Error", "Could not delete post/event.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Your other edit UI here */}
      <HapticButton style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteButtonText}>Delete Post</Text>
      </HapticButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  deleteButton: {
    backgroundColor: "#FF4444",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default EditPostScreen;