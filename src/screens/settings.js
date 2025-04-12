import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../providers/ThemeContext";
import { defaultTheme, blackAndWhiteTheme } from "../providers/theme";
import Header from "../components/header";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import apiClient from "../api/apiClient"; // Assuming you have an apiClient setup

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.mode === "blackAndWhite" ? "#fff" : theme.background, // White background in black-and-white mode
      padding: 20,
    },
    optionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    optionLabel: {
      fontSize: 16,
      fontFamily: "AirbnbCereal-Medium",
      color: theme.mode === "blackAndWhite" ? "#000" : "#333", // Black text in black-and-white mode
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.mode === "blackAndWhite" ? "#000" : theme.primary, // Black buttons in black-and-white mode
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 8,
      marginBottom: 15,
    },
    buttonText: {
      color: theme.mode === "blackAndWhite" ? "#fff" : "#fff", // White text inside buttons in black-and-white mode
      fontSize: 16,
      fontFamily: "AirbnbCereal-Medium",
      marginLeft: 10,
    },
    deleteButton: {
      backgroundColor: "#FF4444", // Red color for delete action remains unchanged
    },
    sliderTrack: {
      false: theme.mode === "blackAndWhite" ? "#000" : "#767577", // Reverse slider track colors
      true: theme.mode === "blackAndWhite" ? "#fff" : theme.primary,
      borderWidth: 1, // Add black trim
      borderColor: "#000", // Black border for the slider
    },
    sliderThumb: {
      color: theme.mode === "blackAndWhite" ? "#000" : "#f4f3f4", // Reverse slider thumb colors
    },
    optionsContainer: {
      marginTop: 10,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      maxHeight: "80%",
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 20,
    },
    modalHeader: {
      fontSize: 18,
      fontFamily: "AirbnbCereal-Medium",
      marginBottom: 10,
      textAlign: "center",
      color: theme.mode === "blackAndWhite" ? "#000" : "#333", // Black text in black-and-white mode
    },
    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
      fontSize: 16,
      fontFamily: "AirbnbCereal-Medium",
      color: theme.mode === "blackAndWhite" ? "#000" : "#333", // Black text in black-and-white mode
    },
    modalButton: {
      backgroundColor: theme.mode === "blackAndWhite" ? "#000" : theme.primary, // Black buttons in black-and-white mode
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    modalButtonText: {
      color: theme.mode === "blackAndWhite" ? "#fff" : "#fff", // White text inside buttons in black-and-white mode
      fontSize: 16,
      fontFamily: "AirbnbCereal-Medium",
    },
    cancelButton: {
      backgroundColor: "#FF4444",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
  });

const Settings = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme, setAppTheme } =
    useTheme() || { theme: defaultTheme, toggleTheme: () => {}, setAppTheme: () => {} };
  const styles = createStyles(theme);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingChange, setLoadingChange] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        setUserId(storedUserId);

        // Fetch current user data to get is_private status
        const response = await apiClient.get(`/users/${storedUserId}`);
        setIsPrivate(response.data.is_private || false);
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert("Error", "Failed to load user data.");
      }
    };
    loadUserData();
  }, []);

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
    Alert.alert(
      "Notification Settings",
      `Notifications ${!notificationsEnabled ? "Enabled" : "Disabled"}`
    );
  };

  const toggleProfileVisibility = async () => {
    try {
      setLoading(true);
      const newValue = !isPrivate;
      await apiClient.put(`/users/${userId}/toggle-visibility`, {
        is_private: newValue,
      });
      setIsPrivate(newValue);
      Alert.alert(
        "Success",
        `Profile is now ${newValue ? "private" : "public"}.`
      );
    } catch (error) {
      console.error("Error toggling profile visibility:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to update profile visibility."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${userId}/download-data`, {
        responseType: "json",
      });

      // Save the JSON data to a file
      const fileUri = `${FileSystem.documentDirectory}user_data_${userId}.json`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(response.data, null, 2)
      );

      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Download your profile data",
        UTI: "public.json",
      });
    } catch (error) {
      console.error("Error downloading profile data:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to download profile data."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async () => {
    Alert.alert(
      "Delete Profile",
      "Are you sure you want to delete your profile? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await apiClient.delete(`/users/${userId}`);
              await AsyncStorage.clear();
              Alert.alert("Success", "Your profile has been deleted.");
              navigation.navigate("SignIn");
            } catch (error) {
              console.error("Error deleting profile:", error);
              Alert.alert(
                "Error",
                error.response?.data?.error || "Failed to delete profile."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");
      navigation.navigate("SignIn");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    setLoadingChange(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      const response = await fetch(
        "http://192.168.1.231:5000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      const data = await response.json();
      setLoadingChange(false);
      if (response.ok) {
        Alert.alert(
          "Success",
          data.message || "Password changed successfully!"
        );
        setIsChangePasswordVisible(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert(
          "Error",
          data.error || data.message || "Failed to change password."
        );
      }
    } catch (error) {
      console.error("Change Password Error:", error);
      setLoadingChange(false);
      Alert.alert(
        "Error",
        error.message || "An error occurred. Please try again."
      );
    }
  };

  // Updated function to handle switching to/from Black & White theme.
  const toggleBlackAndWhiteTheme = async (value) => {
    try {
      if (value) {
        await setAppTheme(blackAndWhiteTheme);
      } else {
        await setAppTheme(defaultTheme);
      }
    } catch (error) {
      console.error("Error switching theme:", error);
      Alert.alert("Error", "Failed to switch theme.");
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Settings"
        onBackPress={() => navigation.goBack()}
        leftButtonStyle={{ marginLeft: -20 }}
        titleStyle={{ marginLeft: -10, marginTop: -10 }}
        arrowStyle={{ transform: [{ translateY: -9 }] }}
      />

      <View style={styles.optionsContainer}>
        {/* Theme Toggle Option (Original vs Lighter) */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>
            Theme: {theme.mode === "lighter" ? "Lighter Blue" : "Original"}
          </Text>
          <Switch
            value={theme.mode === "lighter"}
            onValueChange={toggleTheme}
            trackColor={styles.sliderTrack}
            thumbColor={styles.sliderThumb.color}
          />
        </View>

        {/* New Black & White Theme Option */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>
            {theme.mode === "blackAndWhite"
              ? "Black & White Theme Enabled"
              : "Enable Black & White Theme"}
          </Text>
          <Switch
            value={theme.mode === "blackAndWhite"}
            onValueChange={toggleBlackAndWhiteTheme}
            trackColor={styles.sliderTrack}
            thumbColor={styles.sliderThumb.color}
            disabled={loading}
          />
        </View>

        {/* Notification Toggle */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={styles.sliderTrack}
            thumbColor={styles.sliderThumb.color}
            disabled={loading}
          />
        </View>

        {/* Profile Visibility Toggle */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>
            Hide Profile from Non-Friends
          </Text>
          <Switch
            value={isPrivate}
            onValueChange={toggleProfileVisibility}
            trackColor={styles.sliderTrack}
            thumbColor={styles.sliderThumb.color}
            disabled={loading}
          />
        </View>

        {/* Edit Profile */}
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#ccc" }]}
          onPress={() => navigation.navigate("Profile")}
          disabled={loading}
        >
          <Ionicons name="person-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#ccc" }]}
          onPress={() => setIsChangePasswordVisible(true)}
          disabled={loading}
        >
          <Ionicons name="key-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        {/* Download Profile Data */}
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#ccc" }]}
          onPress={downloadProfileData}
          disabled={loading}
        >
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Download My Data</Text>
        </TouchableOpacity>

        {/* Support & FAQ */}
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#ccc" }]}
          onPress={() => navigation.navigate("SupportFAQ")}
          disabled={loading}
        >
          <Ionicons name="help-circle-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Support & FAQ</Text>
        </TouchableOpacity>

        {/* Delete Profile */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.deleteButton,
            loading && { backgroundColor: "#ccc" },
          ]}
          onPress={deleteProfile}
          disabled={loading}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Delete My Profile</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#ccc" }]}
          onPress={handleSignOut}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator
            size="small"
            color={theme.primary}
            style={{ marginTop: 10 }}
          />
        )}
      </View>

      {/* Change Password Modal */}
      <Modal visible={isChangePasswordVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#aaa"
            />
            {loadingChange ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.modalButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsChangePasswordVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Settings;