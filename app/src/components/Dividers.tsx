import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "./Themed";
import { Regular12 } from "./StyledText";

type DividerWithTextProps = {
  text: string;
};

export const DividerWithText: React.FC<DividerWithTextProps> = ({ text }) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <View>
        <Regular12 style={styles.text}>{text}</Regular12>
      </View>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.secondaryLightGrey,
  },
  text: {
    paddingHorizontal: 5,
    color: Colors.dark.secondaryLightGrey,
    lineHeight: 12,
  },
});
