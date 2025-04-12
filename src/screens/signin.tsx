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
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeSocket } from "../providers/ws-client";
import jwtDecode from "jwt-decode";
import apiClient from "../api/apiClient";

const SignIn = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
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
    (async () => {
      const savedEmail = await AsyncStorage.getItem("savedEmail");
      const savedPassword = await AsyncStorage.getItem("savedPassword");
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRemember(true);
      }
    })();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4169E1" />
      </View>
    );
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      // Check for response status or data as needed
      if (!(response.status === 200 || response.status === 201)) {
        throw new Error(response.data.message || response.data.error || "Login failed");
      }
      const token = response.data.token;
      let userId = response.data.userId;
      if (!userId) {
        const decoded = jwtDecode(token);
        userId = decoded.userId;
      }
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userId", userId);

      if (remember) {
        await AsyncStorage.setItem("savedEmail", email);
        await AsyncStorage.setItem("savedPassword", password);
      } else {
        await AsyncStorage.removeItem("savedEmail");
        await AsyncStorage.removeItem("savedPassword");
      }

      const socket = await initializeSocket();
      if (!socket) {
        throw new Error("Failed to initialize WebSocket connection");
      }

      navigation.navigate("Home"); // Navigate directly to the homepage
    } catch (error: any) {
      Alert.alert("Error", error.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/circleupmainlogo.png")} style={styles.logo} />
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.rememberMeContainer}>
        <TouchableOpacity onPress={() => setRemember(!remember)} style={styles.checkbox}>
          {remember && <Ionicons name="checkmark" size={20} color="white" />}
        </TouchableOpacity>
        <Text style={styles.rememberMeText}>Remember Me</Text>
      </View>

      <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.signInText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.signUpLink} onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
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
    marginBottom: 30,
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
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#0A58CA",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A58CA",
    marginRight: 8,
  },
  rememberMeText: {
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
    color: "#333",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#0A58CA",
    fontSize: 14,
    fontFamily: "AirbnbCereal_Md",
  },
  signInButton: {
    backgroundColor: "#0A58CA",
    paddingVertical: 12,
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  signInText: {
    color: "white",
    fontSize: 18,
    fontFamily: "AirbnbCereal_Md",
  },
  signUpLink: {
    marginTop: 10,
  },
  signUpText: {
    color: "#0A58CA",
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
});

export default SignIn;
