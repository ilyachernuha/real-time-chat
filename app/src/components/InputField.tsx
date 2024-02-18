import React, { ComponentProps } from "react";
import { TextInput, StyleSheet, TextStyle, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { Light } from "./StyledText";

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: ComponentProps<typeof TextInput>["onChangeText"];
  style?: TextStyle | TextStyle[];
  isPassword?: boolean;
  error?: string;
  hidePassword?: boolean;
  toggleHidePassword?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  isPassword,
  error,
  hidePassword,
  toggleHidePassword,
}) => {
  return (
    <View style={{ paddingBottom: 24 }}>
      <View
        style={[
          styles.container,
          { paddingRight: isPassword ? 0 : 16 },
          {
            borderColor: error
              ? Colors.dark.mainErrorRed
              : value
              ? Colors.dark.mainPurple
              : Colors.dark.secondaryLightGrey,
          },
        ]}
      >
        <TextInput
          style={[{ flex: 1, color: error ? Colors.dark.mainErrorRed : Colors.dark.text }, Fonts.regular14]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={Colors.dark.secondaryLightGrey}
          secureTextEntry={isPassword && hidePassword}
          autoCapitalize="none"
        />
        {isPassword && (
          <MaterialCommunityIcons
            name={hidePassword ? "eye-off" : "eye"}
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
