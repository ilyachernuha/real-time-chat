import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import React, { ComponentProps } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
  onPress: ComponentProps<typeof TouchableOpacity>["onPress"];
  title: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onPress, title, disabled }) => (
  <TouchableOpacity
    style={[{ backgroundColor: disabled ? Colors.dark.secondaryLightGrey : Colors.dark.mainPurple }, styles.button]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[{ color: disabled ? Colors.dark.mainDarkGrey : Colors.dark.text }, styles.text, Fonts.regular14]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  button: {
    paddingVertical: 13.5,
    borderRadius: 12,
  },
  text: {
    textAlign: "center",
  },
});

export default Button;
