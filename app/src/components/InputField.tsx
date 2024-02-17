import React, { ComponentProps, useState } from "react";
import { TextInput, StyleSheet, TextStyle, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { Text } from "./Themed";
import { Light } from "./StyledText";

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: ComponentProps<typeof TextInput>["onChangeText"];
  style?: TextStyle | TextStyle[];
  isPassword?: boolean;
  isUsername?: boolean;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ placeholder, value, onChangeText, isPassword, isUsername, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={{ paddingBottom: 24 }}>
      <View
        style={[
          styles.container,
          {
            borderColor: error
              ? Colors.dark.mainErrorRed
              : value
              ? Colors.dark.mainPurple
              : Colors.dark.secondaryLightGrey,
          },
        ]}
      >
        {isUsername && (
          <MaterialIcons
            name="alternate-email"
            size={24}
            color={Colors.dark.secondaryLightGrey}
            style={{ paddingRight: 0 }}
          />
        )}
        <TextInput
          style={[{ flex: 1, color: error ? Colors.dark.mainErrorRed : Colors.dark.text }, Fonts.regular14]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={Colors.dark.secondaryLightGrey}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
        />
        {isPassword && (
          <MaterialCommunityIcons
            name={showPassword ? "eye" : "eye-off"}
            size={24}
            color={Colors.dark.secondaryLightGrey}
            onPress={toggleShowPassword}
            style={{ position: "absolute", right: 8, padding: 10 }}
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
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.mainDarkGrey,
    gap: 4,
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
