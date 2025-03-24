import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightComponent?: React.ReactNode;
  onRightPress?: () => void;
  titleStyle?: object;
  leftButtonStyle?: object;
  arrowStyle?: object; // New prop for arrow styling
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightIcon,
  rightComponent,
  onRightPress,
  titleStyle,
  leftButtonStyle,
  arrowStyle, // Destructure arrowStyle
}) => {
  const navigation = useNavigation();
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {showBackButton ? (
        <TouchableOpacity onPress={handleBack} style={[styles.leftButton, leftButtonStyle]}>
          <Ionicons name="arrow-back" size={28} color="#000" style={arrowStyle} />
        </TouchableOpacity>
      ) : (
        <View style={styles.leftButton} />
      )}
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {rightComponent ? (
        <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
          {rightComponent}
        </TouchableOpacity>
      ) : rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
          <Ionicons name={rightIcon} size={28} color="#000" />
        </TouchableOpacity>
      ) : (
        <View style={styles.rightButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 40) + 20 : 60,
    borderBottomWidth: 0, // Removed border
  },
  leftButton: {
    width: 40,
    alignItems: "flex-start",
    marginTop: 10, // Lowered by 10pt
  },
  title: {
    fontSize: 22,
    marginLeft: 0, // Default – now adjustable via titleStyle
    marginTop: 10, // Lowered by 10pt
    color: "#000",
    fontFamily: "AirbnbCereal_Md",
  },
  rightButton: {
    padding: 5,
    alignItems: "flex-start",
    justifyContent: "center",
  },
});

export default Header;