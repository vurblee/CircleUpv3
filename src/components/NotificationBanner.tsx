import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useNotification } from "../contexts/NotificationContext";

const NotificationBanner: React.FC = () => {
  const { notification } = useNotification();

  // Only render if notification.message exists
  if (!notification || !notification.message) return null;

  return (
    <Animated.View style={styles.banner}>
      <Text style={styles.bannerText}>{notification.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#668CFF",
    padding: 10,
    zIndex: 1000,
    alignItems: "center",
  },
  bannerText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "AirbnbCereal_Md",
  },
});

export default NotificationBanner;