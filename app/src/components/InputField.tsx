import React, { ComponentProps, useState } from "react";
import { TextInput, StyleSheet, TextStyle, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: ComponentProps<typeof TextInput>["onChangeText"];
  style?: TextStyle | TextStyle[];
  isPassword?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ placeholder, value, onChangeText, isPassword }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={[styles.container, { borderColor: value ? Colors.dark.mainBlue : Colors.dark.secondaryLightGrey }]}>
      <TextInput
        style={[styles.input, Fonts.regular14]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={Colors.dark.secondaryLightGrey}
        secureTextEntry={isPassword && !showPassword}
      />
      {isPassword && (
        <MaterialCommunityIcons
          name={showPassword ? "eye" : "eye-off"}
          size={24}
          color={Colors.dark.secondaryLightGrey}
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
    backgroundColor: Colors.dark.mainDarkGrey,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
  },
  icon: {},
});

export default InputField;
