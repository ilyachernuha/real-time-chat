import React, { ComponentProps, ReactNode } from "react";
import { TextInput, StyleSheet, TextStyle } from "react-native";
import { colors, fonts } from "../../config/theme";

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
  return (
    <TextInput
      style={[styles.input, fonts.regular_14, style]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={colors.secondary.light_grey}
      secureTextEntry={isPassword}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderColor: colors.secondary.light_grey,
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 16,
    color: colors.text.white,
    backgroundColor: colors.main.dark_grey,
  },
});

export default InputField;
