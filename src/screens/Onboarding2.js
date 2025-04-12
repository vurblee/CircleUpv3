import React, { useCallback, useRef } from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Onboarding2 = () => {
  const navigation = useNavigation();
  const goToOnboarding3 = useCallback(() => navigation.navigate("Onboarding3"), [navigation]);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <View style={styles.container}>
      <Image 
        source={require("../../assets/onboardingphone22.png")} 
        style={styles.image} 
      />
      <Text style={styles.text}>
        Host Your Own Events and Explore Integration and Scheduling with Ease
      </Text>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={goToOnboarding3}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonText}>Next</Text>
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
  },
  image: {
    width: "100%",
    height: "70%",
    resizeMode: "contain",
    alignSelf: "center",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 30,
    color: "#0A58CA",
    marginTop: 25,
    fontWeight: "600",
    fontFamily: "AirbnbCereal", // Updated to Airbnb font
  },
  button: {
    backgroundColor: "#0A58CA",
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
    fontFamily: "AirbnbCereal", // Updated to Airbnb font
  },
});

export default Onboarding2;

