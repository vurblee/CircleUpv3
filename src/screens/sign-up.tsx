import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Font from "expo-font";
import apiClient from "../api/apiClient";

const SignUp = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [name, setName] = useState(""); // New state for name
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

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/signup", {
        username, // Include username
        name, // Include name
        email,
        password,
        role: "user",
      });
      setLoading(false);
      if (response.status === 200 || response.status === 201) {
        alert("Signup successful!");
        navigation.navigate("SignIn");
      } else {
        alert(response.data.message || response.data.error || "Signup failed");
      }
    } catch (error: any) {
      console.error("Signup error:", error.response?.data || error.message);
      setLoading(false);
      alert(
        error.response?.data.message ||
          error.response?.data.error ||
          "An error occurred. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/circleupmainlogo.png")} style={styles.logo} />
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#aaa"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.signUpButton}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.signUpText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signInLink}
        onPress={() => navigation.navigate("SignIn")}
      >
        <Text style={styles.signInText}>Already have an account? Sign In</Text>
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
  signUpButton: {
    backgroundColor: "#0A58CA",
    paddingVertical: 12,
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  signUpText: {
    color: "white",
    fontSize: 18,
    fontFamily: "AirbnbCereal_Md",
  },
  signInLink: {
    marginTop: 10,
  },
  signInText: {
    color: "#0A58CA",
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
});

export default SignUp;
