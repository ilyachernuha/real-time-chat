import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import React from "react";
import { StyleSheet, PressableProps, Pressable, View } from "react-native";
import StyledText from "./StyledText";

interface Props extends PressableProps {
  title: string;
}

export const Button = ({ title, disabled, ...props }: Props) => (
  <Pressable disabled={disabled} {...props}>
    {({ pressed }) => {
      return (
        <View style={[styles.button, styles.main, pressed && styles.mainPressed, disabled && styles.mainDisabled]}>
          <StyledText font="14" style={disabled && styles.mainDisabled}>
            {title}
          </StyledText>
        </View>
      );
    }}
  </Pressable>
);

export const SecondaryButton = ({ title, disabled, ...props }: Props) => (
  <Pressable disabled={disabled} {...props}>
    {({ pressed }) => {
      return (
        <View
          style={[
            styles.button,
            styles.secondary,
            pressed && styles.secondaryPressed,
            disabled && styles.secondaryDisabled,
          ]}
        >
          <StyledText
            font="14"
            style={[styles.secondary, pressed && styles.secondaryPressed, disabled && styles.secondaryDisabled]}
          >
            {title}
          </StyledText>
        </View>
      );
    }}
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  main: {
    backgroundColor: Colors.dark.mainPurple,
  },
  mainDisabled: {
    backgroundColor: Colors.dark.secondaryLightGrey,
    color: Colors.dark.mainDarkGrey,
  },
  mainPressed: {
    backgroundColor: Colors.dark.secondaryBlue,
  },
  secondary: {
    borderColor: Colors.dark.mainPurple,
    color: Colors.dark.mainPurple,
  },
  secondaryDisabled: {
    borderColor: Colors.dark.mainDarkGrey,
    color: Colors.dark.mainDarkGrey,
  },
  secondaryPressed: {
    borderColor: Colors.dark.secondaryBlue,
    color: Colors.dark.secondaryBlue,
  },
});
