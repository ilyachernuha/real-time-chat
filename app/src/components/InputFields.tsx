import React, { forwardRef } from "react";
import { TextInput, StyleSheet, View, TextInputProps, Pressable } from "react-native";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import VisibilityOff from "./icons/VisibilityOff";
import Visibility from "./icons/Visibility";
import StyledText from "./StyledText";

interface InputFieldProps extends TextInputProps {
  error?: boolean | string;
  isPassword?: boolean;
  toggleHidePassword?: () => void;
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ error, isPassword, toggleHidePassword, ...props }, ref) => {
    return (
      <View style={{ paddingBottom: 24 }}>
        <View
          style={[
            styles.container,
            {
              borderColor: error
                ? Colors.dark.mainErrorRed
                : props.value
                ? Colors.dark.mainPurple
                : Colors.dark.secondaryLightGrey,
            },
          ]}
        >
          <TextInput
            cursorColor={Colors.dark.text}
            ref={ref}
            style={[
              {
                flex: 1,
                color: error ? Colors.dark.mainErrorRed : Colors.dark.text,
                height: "100%",
                paddingLeft: 16,
                paddingRight: isPassword ? 0 : 16,
              },
              Fonts[14],
            ]}
            placeholderTextColor={Colors.dark.secondaryLightGrey}
            {...props}
          />

          {isPassword && (
            <Pressable style={{ padding: 10 }} onPress={toggleHidePassword}>
              {props.secureTextEntry ? (
                <VisibilityOff size={24} color={Colors.dark.secondaryLightGrey} />
              ) : (
                <Visibility size={24} color={Colors.dark.secondaryLightGrey} />
              )}
            </Pressable>
          )}
        </View>
        <StyledText font="light" style={styles.error}>
          {error}
        </StyledText>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    backgroundColor: Colors.dark.mainDarkGrey,
  },
  input: {
    flex: 1,
  },
  error: {
    color: Colors.dark.mainErrorRed,
    position: "absolute",
    bottom: 0,
    paddingVertical: 5,
  },
});

export default InputField;
