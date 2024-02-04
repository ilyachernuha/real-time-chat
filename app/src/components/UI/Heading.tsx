import React, { ReactNode } from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { colors, fonts } from "../../config/theme";

interface HeadingProps {
  children: ReactNode;
  style?: TextStyle | TextStyle[];
}

const Heading: React.FC<HeadingProps> = ({ children, style }) => {
  return <Text style={[styles.heading, fonts.bold, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  heading: {
    color: colors.text.white,
    shadowColor: "#000000",
    textAlign: "center",
  },
});

export default Heading;
