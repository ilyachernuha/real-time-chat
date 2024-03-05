import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import React, { ComponentProps } from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

interface ButtonProps {
  onPress?: ComponentProps<typeof TouchableOpacity>["onPress"];
  title: string;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export const Button: React.FC<ButtonProps> = ({ onPress, title, disabled, style }) => (
  <TouchableOpacity
    style={[
      { backgroundColor: disabled ? Colors.dark.secondaryLightGrey : Colors.dark.mainPurple },
      styles.button,
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[{ color: disabled ? Colors.dark.mainDarkGrey : Colors.dark.text }, styles.text, Fonts.regular14]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export const SecondaryButton: React.FC<ButtonProps> = ({ onPress, title, disabled, style }) => (
  <TouchableOpacity
    style={[styles.button, { borderColor: Colors.dark.mainPurple, borderWidth: 1 }, style]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[{ color: Colors.dark.mainPurple }, styles.text, Fonts.regular14]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 13.5,
    borderRadius: 12,
  },
  text: {
    textAlign: "center",
  },
});
