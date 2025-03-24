import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import * as Haptics from "expo-haptics";

type HapticButtonProps = TouchableOpacityProps & {
  onPress: () => void;
};

const HapticButton: React.FC<HapticButtonProps> = ({ onPress, children, ...props }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
};

export default HapticButton;