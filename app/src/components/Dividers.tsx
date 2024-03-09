import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet } from "react-native";
import { View } from "./Themed";
import StyledText from "./StyledText";

type Props = {
  text: string;
};

export const DividerWithText = ({ text }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <View>
        <StyledText font="12" style={styles.text}>
          {text}
        </StyledText>
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
