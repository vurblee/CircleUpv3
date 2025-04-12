import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SplashScreen = () => {
  const navigation = useNavigation();

  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(200)).current;
  const entryScaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Start the entry spin (fast spin while sliding in)
    Animated.parallel([
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(entryScaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 2, // ~2 full spins during entry
        duration: 600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After entry, slow down to stop at target angle
      Animated.sequence([
        Animated.timing(spinAnim, {
          toValue: 2.975, // final resting position
          duration: 900,
          easing: Easing.out(Easing.exp), // smooth slow down
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.replace("SignIn");
      });
    });
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const sharedStyle = {
    transform: [{ translateX: translateXAnim }, { scale: entryScaleAnim }],
    opacity: fadeAnim,
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Outer Ring */}
        <Animated.Image
          source={require("../../assets/circlerings2_centered.png")}
          style={[styles.baseImage, sharedStyle]}
        />

        {/* Spinning Inner Ring */}
        <Animated.View
          style={[styles.spinWrapper, { transform: [{ rotate: spin }] }]}
        >
          <Animated.Image
            source={require("../../assets/circleuprings_perfectly_centered.png")}
            style={[styles.spinImage, sharedStyle]}
          />
        </Animated.View>
      </View>
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
  logoContainer: {
    position: "relative",
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  baseImage: {
    width: 130,
    height: 130,
    resizeMode: "contain",
    position: "absolute",
    marginBottom: 20,
  },
  spinWrapper: {
    width: 80,
    height: 80,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  spinImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
});

export default SplashScreen;
