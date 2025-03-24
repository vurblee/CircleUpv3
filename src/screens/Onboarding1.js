import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";

const Onboarding1 = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(1)).current; // Opacity for screen fade-out
  const logoSlideAnim = useRef(new Animated.Value(80)).current; // Slide-in animation for logo
  const logoFadeAnim = useRef(new Animated.Value(0)).current; // Opacity for logo fade-in/out

  const [fontsLoaded] = useFonts({
    AirbnbCereal: require("../../assets/fonts/AirbnbCereal_W_Md.otf"),
  });

  useEffect(() => {
    // Logo animation (slides in and fades in)
    Animated.parallel([
      Animated.timing(logoSlideAnim, {
        toValue: 0, // Move to original position
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(logoFadeAnim, {
        toValue: 1, // Fade in
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold the logo for a second before fading out
      setTimeout(() => {
        Animated.timing(logoFadeAnim, {
          toValue: 0, // Fade out
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 1500);
    });

    // Fade out entire screen after 3 seconds
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace("Onboarding2"); // Navigate after fade-out
      });
    }, 3000);
  }, []);

  if (!fontsLoaded) {
    return null; // Prevent rendering before font loads
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Onboarding Phone Image */}
      <Image source={require("../../assets/onboarding1phone.png")} style={styles.image} />
      
      {/* Enlarged Community Connect Logo */}
      <Animated.Image
        source={require("../../assets/circleupmainlogo.png")}
        style={[
          styles.logo,
<<<<<<< HEAD
          {
            marginLeft: 2.5, // Shift logo to same horizontal spot as SplashScreen
            transform: [{ translateY: logoSlideAnim }],
            opacity: logoFadeAnim,
          },
=======
          { transform: [{ translateY: logoSlideAnim }], opacity: logoFadeAnim },
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
        ]}
      />
    </Animated.View>
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
    height: "45%", // Keeps phone aligned
    resizeMode: "contain",
    marginBottom: 40, // Increased spacing for bigger logo
<<<<<<< HEAD
    // marginLeft removed to center the image
=======
>>>>>>> 3d5c1e9f8ce7ebc2115e7397d18a5809a1f71f7b
  },
  logo: {
    width: 840, // 🔥 Much larger
    height: 270,
    resizeMode: "contain",
  },
});

export default Onboarding1;

