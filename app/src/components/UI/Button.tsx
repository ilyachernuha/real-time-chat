import React, { ComponentProps } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../config/theme";

interface ButtonProps {
  onPress: ComponentProps<typeof TouchableOpacity>["onPress"];
  title: string;
}

const Button: React.FC<ButtonProps> = ({ onPress, title }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={[styles.text, fonts.regular_14]}>{title}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.main.blue,
    paddingVertical: 13.5,
    borderRadius: 12,
  },
  text: {
    color: colors.text.white,
    textAlign: "center",
  },
});

export default Button;
