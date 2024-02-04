import React, { ComponentProps, ReactNode, useState } from "react";
import { TextInput, StyleSheet, TextStyle, View } from "react-native";
import { colors, fonts } from "../../config/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: ComponentProps<typeof TextInput>["onChangeText"];
  style?: TextStyle | TextStyle[];
  isPassword?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  style,
  isPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View
      style={[
        styles.container,
        { borderColor: value ? colors.main.blue : colors.secondary.light_grey },
      ]}
    >
      <TextInput
        style={[styles.input, fonts.regular_14]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.secondary.light_grey}
        secureTextEntry={isPassword && !showPassword}
      />
      {isPassword && (
        <MaterialCommunityIcons
          name={showPassword ? "eye" : "eye-off"}
          size={24}
          color={colors.secondary.light_grey}
          style={styles.icon}
          onPress={toggleShowPassword}
        />
      )}
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
    backgroundColor: colors.main.dark_grey,
  },
  input: {
    flex: 1,
    color: colors.text.white,
  },
  icon: {},
});

export default InputField;
