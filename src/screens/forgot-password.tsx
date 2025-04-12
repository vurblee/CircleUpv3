import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Font from "expo-font";
import apiClient from "../api/apiClient";

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      AirbnbCereal_Md: require("../../assets/fonts/AirbnbCereal_W_Md.otf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4169E1" />
      </View>
    );
  }

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      setLoading(false);
      Alert.alert("Success", response.data.message);
      navigation.navigate("SignIn");
    } catch (error: any) {
      console.error("Forgot Password Error:", error.response?.data || error.message);
      setLoading(false);
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to send reset link."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/circleupmainlogo.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email and we will send you a password reset link.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.resetText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backToSignIn}
        onPress={() => navigation.navigate("SignIn")}
      >
        <Text style={styles.backToSignInText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontFamily: "AirbnbCereal_Md",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
  resetButton: {
    backgroundColor: "#0A58CA",
    paddingVertical: 12,
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  resetText: {
    color: "white",
    fontSize: 18,
    fontFamily: "AirbnbCereal_Md",
  },
  backToSignIn: {
    marginTop: 10,
  },
  backToSignInText: {
    color: "#0A58CA",
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
});

export default ForgotPassword;
