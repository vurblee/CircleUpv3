import React, { useState } from "react";
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
import { defaultTheme } from "../providers/theme";
<<<<<<< HEAD
import Header from "../components/header";  // <-- Import Header
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
<<<<<<< HEAD
      backgroundColor: theme.background,
      padding: 20,
      // Remove paddingTop if it conflicts with the imported Header
    },
    // Remove custom header styles if not needed:
    headerText: {
      fontSize: 24,
      fontFamily: "AirbnbCereal-Medium",
      color: "#333",
=======
      backgroundColor: theme.background, // White remains white
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 30,
    },
    headerText: {
      fontSize: 24,
      fontFamily: "AirbnbCereal-Medium",
      color: "#333", // Dark text stays dark
      flex: 1,
      textAlign: "center",
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
<<<<<<< HEAD
      color: "#333",
=======
      color: "#333", // Dark text
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
<<<<<<< HEAD
      backgroundColor: theme.primary,
=======
      backgroundColor: theme.primary, // Blue toggles here
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 8,
      marginBottom: 15,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "AirbnbCereal-Medium",
      marginLeft: 10,
    },
<<<<<<< HEAD
    optionsContainer: {
      marginTop: 10, // Reduced from 50 to 30 to raise the content
    },
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
      color: "#333",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
      fontSize: 16,
      fontFamily: "AirbnbCereal-Medium",
      color: "#333",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 10,
    },
    modalButton: {
<<<<<<< HEAD
      backgroundColor: theme.primary,
=======
      backgroundColor: theme.primary, // Toggled color
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    modalButtonText: {
      color: "#fff",
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
<<<<<<< HEAD
  const { theme, toggleTheme } =
    useTheme() || { theme: defaultTheme, toggleTheme: () => {} };
=======

  // Destructure theme and toggleTheme from the context. Fallback if needed.
  const { theme, toggleTheme } = useTheme() || { theme: defaultTheme, toggleTheme: () => {} };
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const styles = createStyles(theme);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
<<<<<<< HEAD
=======

  // Change Password State
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingChange, setLoadingChange] = useState(false);

<<<<<<< HEAD
=======
  // Toggle for notifications
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
    Alert.alert(
      "Notification Settings",
      `Notifications ${!notificationsEnabled ? "Enabled" : "Disabled"}`
    );
  };

<<<<<<< HEAD
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

=======
  // Submit Change Password
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
<<<<<<< HEAD
      if (!token) {
        throw new Error("No authentication token found.");
      }
      const response = await fetch("http://192.168.1.231:5000/api/auth/change-password", {
=======
      const response = await fetch("http://10.0.2.2:5000/api/auth/change-password", {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      setLoadingChange(false);
      if (response.ok) {
        Alert.alert("Success", data.message || "Password changed successfully!");
        setIsChangePasswordVisible(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Error", data.error || data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Change Password Error:", error);
      setLoadingChange(false);
<<<<<<< HEAD
      Alert.alert("Error", error.message || "An error occurred. Please try again.");
=======
      Alert.alert("Error", "An error occurred. Please try again.");
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    }
  };

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      {/* Replace custom header with Header component */}
      <Header
        title="Settings"
        onBackPress={() => navigation.goBack()}
        leftButtonStyle={{ marginLeft: -20 }}      // Existing adjustment for left button container
        titleStyle={{ marginLeft: -10, marginTop: -10 }} // Your title style
        arrowStyle={{ transform: [{ translateY: -9 }] }} // Move only the arrow down by 10pt
      />

      <View style={styles.optionsContainer}>
        {/* Theme Toggle Option */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>
            Theme: {theme.mode === "lighter" ? "Lighter Blue" : "Original"}
          </Text>
          <Switch
            value={theme.mode === "lighter"}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: theme.primary }}
            thumbColor="#f4f3f4"
          />
        </View>

        {/* Notification Toggle */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#767577", true: theme.primary }}
            thumbColor="#f4f3f4"
          />
        </View>

        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsChangePasswordVisible(true)}
        >
          <Ionicons name="key-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        {/* Support & FAQ */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("SupportFAQ")}
        >
          <Ionicons name="help-circle-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Support & FAQ</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

=======
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Theme Toggle Option */}
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>
          Theme: {theme.mode === "lighter" ? "Lighter Blue" : "Original"}
        </Text>
        <Switch
          value={theme.mode === "lighter"}
          onValueChange={toggleTheme}
          trackColor={{ false: "#767577", true: theme.primary }}
          thumbColor="#f4f3f4"
        />
      </View>

      {/* Notification Toggle */}
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: "#767577", true: theme.primary }}
          thumbColor="#f4f3f4"
        />
      </View>

      {/* Edit Profile */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Profile")}>
        <Ionicons name="person-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Change Password */}
      <TouchableOpacity style={styles.button} onPress={() => setIsChangePasswordVisible(true)}>
        <Ionicons name="key-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      {/* Support & FAQ */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => Alert.alert("Coming Soon", "Support & FAQ is coming soon!")}
      >
        <Ionicons name="help-circle-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Support & FAQ</Text>
      </TouchableOpacity>

      {/* Sign Out */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("SignIn")}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      {/* Change Password Modal */}
      <Modal visible={isChangePasswordVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Change Password</Text>
<<<<<<< HEAD
=======

>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
<<<<<<< HEAD
=======

>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            {loadingChange ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <View style={styles.modalButtons}>
<<<<<<< HEAD
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.modalButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
=======
                <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
                  <Text style={styles.modalButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#FF4444" }]}
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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

<<<<<<< HEAD
export default Settings;
=======
export default Settings;
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
