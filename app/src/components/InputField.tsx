import React, { ComponentProps, useState } from "react";
import { TextInput, StyleSheet, TextStyle, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: ComponentProps<typeof TextInput>["onChangeText"];
  style?: TextStyle | TextStyle[];
  isPassword?: boolean;
  isUsername?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ placeholder, value, onChangeText, isPassword, isUsername }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={[styles.container, { borderColor: value ? Colors.dark.mainPurple : Colors.dark.secondaryLightGrey }]}>
      {isUsername && (
        <MaterialIcons
          name="alternate-email"
          size={24}
          color={Colors.dark.secondaryLightGrey}
          style={{ paddingRight: 0 }}
        />
      )}
      <TextInput
        style={[styles.input, Fonts.regular14]}
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
    gap: 4,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
  },
  icon: {},
});

export default InputField;
