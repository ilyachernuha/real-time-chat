import React, { forwardRef } from "react";
import { TextInput, StyleSheet, View, TextInputProps, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { Light } from "./StyledText";
import VisibilityOff from "./icons/VisibilityOff";
import Visibility from "./icons/Visibility";

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
            ref={ref}
            style={[
              { flex: 1, color: error ? Colors.dark.mainErrorRed : Colors.dark.text, height: "100%", paddingLeft: 16 },
              Fonts.regular14,
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
        <Light style={styles.error}>{error}</Light>
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
