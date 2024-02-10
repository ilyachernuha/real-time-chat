import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import React, { ComponentProps } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
  onPress: ComponentProps<typeof TouchableOpacity>["onPress"];
  title: string;
}

const Button: React.FC<ButtonProps> = ({ onPress, title }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={[styles.text, Fonts.regular14]}>{title}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.dark.mainBlue,
    paddingVertical: 13.5,
    borderRadius: 12,
  },
  text: {
    color: Colors.dark.text,
    textAlign: "center",
  },
});

export default Button;
