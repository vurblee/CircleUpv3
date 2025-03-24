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
<<<<<<< HEAD
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig.extra.API_BASE_URL;

const SignIn = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadFonts = async () => {
=======

const SignIn: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Load custom font
  const loadFonts = async (): Promise<void> => {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    await Font.loadAsync({
      AirbnbCereal_Md: require("../../assets/fonts/AirbnbCereal_W_Md.otf"),
    });
    setFontsLoaded(true);
  };

<<<<<<< HEAD
=======
  // On mount, load saved credentials if they exist
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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

<<<<<<< HEAD
  const handleSignIn = async () => {
=======
  const handleSignIn = async (): Promise<void> => {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
<<<<<<< HEAD
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
=======
      console.log("Sending login request");
      const response = await fetch("http://10.0.2.2:5000/api/auth/login", {
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
<<<<<<< HEAD
      const data = await response.json();
=======
      const data: { token: string; message?: string; error?: string; userId?: string } = await response.json();
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b

      if (!response.ok) {
        throw new Error(data.message || data.error || "Login failed");
      }

      const token = data.token;
<<<<<<< HEAD
      let userId = data.userId;
      if (!userId) {
        const decoded = jwtDecode(token);
=======
      let userId = data.userId; // Use userId from response if provided
      if (!userId) {
        // Decode token to get userId if not in response
        const decoded: any = jwtDecode(token);
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        userId = decoded.userId;
      }

      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userId", userId);
<<<<<<< HEAD

=======
      console.log("Token saved:", token, "User ID saved:", userId);

      // If Remember Me is checked, save the email and password
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
<<<<<<< HEAD

      Alert.alert("Success", data.message || "Login successful!");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Error", error.message || "Network error. Please try again.");
    } finally {
=======
      console.log("Socket initialized successfully");

      Alert.alert("Success", data.message || "Login successful!");
      console.log("Navigating to Home");
      navigation.navigate("Home");
    } catch (error: any) {
      console.error("Sign-in error:", error);
      Alert.alert("Error", error.message || "Network error. Please try again.");
    } finally {
      console.log("Setting loading to false in SignIn");
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/circleupmainlogo.png")} style={styles.logo} />
      <Text style={styles.title}>Welcome Back</Text>
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

<<<<<<< HEAD
      <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={loading}>
=======
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signInButton}
        onPress={handleSignIn}
        disabled={loading}
      >
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.signInText}>Sign In</Text>
        )}
      </TouchableOpacity>

<<<<<<< HEAD
      <TouchableOpacity style={styles.signUpLink} onPress={() => navigation.navigate("SignUp")}>
=======
      <TouchableOpacity
        style={styles.signUpLink}
        onPress={() => navigation.navigate("SignUp")}
      >
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
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
