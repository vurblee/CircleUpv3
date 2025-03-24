import React, { useRef } from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Onboarding3 = () => {
  const navigation = useNavigation();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/onboardingphone3.png")} style={styles.image} />
<<<<<<< HEAD
      <Text style={styles.text}>
        Look Up More Events or Activities Nearby Using the Map
      </Text>
=======
      <Text style={styles.text}>Look Up More Events or Activities Nearby Using the Map</Text>
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
      
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("SignIn")}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: "100%",
    height: "70%",
    resizeMode: "contain",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 30,
<<<<<<< HEAD
    color: "#0A58CA", // Updated primary color
    marginTop: 25,
    fontWeight: "600",
    fontFamily: "AirbnbCereal", // Updated to Airbnb font
  },
  button: {
    backgroundColor: "#0A58CA", // Updated primary color
=======
    color: "#4169E1",
    marginTop: 25,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#4169E1",
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
    marginTop: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
<<<<<<< HEAD
    fontFamily: "AirbnbCereal", // Updated to Airbnb font
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  },
});

export default Onboarding3;

