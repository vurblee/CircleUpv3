import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated, Easing } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SplashScreen = () => {
  const navigation = useNavigation();

  // Animated values
  const slideAnim = useRef(new Animated.Value(200)).current; // Starts off-screen (right)
  const scaleAnim = useRef(new Animated.Value(1.2)).current; // Slightly larger start
  const fadeAnim = useRef(new Animated.Value(1)).current; // Fully visible

  useEffect(() => {
    Animated.sequence([
      // Slide in smoothly
      Animated.timing(slideAnim, {
        toValue: 0, // Moves to center
        duration: 600, // Quick & premium feel
        easing: Easing.out(Easing.exp), // Smooth ease-out effect
        useNativeDriver: true,
      }),
      // Bobble effect with bounce
      Animated.timing(scaleAnim, {
        toValue: 1.1, // Slight overshoot
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1, // Settle back
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Hold position briefly before shrink
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.7, // Shrinks down
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0, // Fade out
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      navigation.replace("Onboarding1"); // Navigate to first onboarding screen
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/circleupmainlogo.png")}
        style={[
          styles.logo,
          {
<<<<<<< HEAD
            marginLeft: 2.5,  // Shift logo 2.5pt to the right
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
            transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      />
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
  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    shadowColor: "#4169E1", // Premium soft glow effect
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5, // Crisp depth effect
  },
});

export default SplashScreen;

