import React from "react";
import { TextInput, StyleSheet, View, TextInputProps } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { Light } from "./StyledText";

interface InputFieldProps extends TextInputProps {
  error?: boolean | string;
  isPassword?: boolean;
  toggleHidePassword?: () => void;
}

const InputField = (props: InputFieldProps) => {
  const { error, toggleHidePassword, isPassword, ...otherProps } = props;
  return (
    <View style={{ paddingBottom: 24 }}>
      <View
        style={[
          styles.container,
          { paddingRight: isPassword ? 0 : 16 },
          {
            borderColor: error
              ? Colors.dark.mainErrorRed
              : otherProps.value
              ? Colors.dark.mainPurple
              : Colors.dark.secondaryLightGrey,
          },
        ]}
      >
        <TextInput
          style={[{ flex: 1, color: error ? Colors.dark.mainErrorRed : Colors.dark.text }, Fonts.regular14]}
          placeholderTextColor={Colors.dark.secondaryLightGrey}
          {...otherProps}
        />
        {isPassword && (
          <MaterialCommunityIcons
            name={otherProps.secureTextEntry ? "eye-off" : "eye"}
            size={24}
            color={Colors.dark.secondaryLightGrey}
            onPress={toggleHidePassword}
            style={{ padding: 10 }}
          />
        )}
      </View>
      <Light style={styles.error}>{error}</Light>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    paddingLeft: 16,
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
