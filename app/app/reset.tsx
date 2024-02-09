import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Logo from "../src/components/Logo";
import Heading from "../src/components/UI/Heading";
import InputField from "../src/components/UI/InputField";
import Button from "../src/components/UI/Button";
import { colors, fonts } from "../src/config/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Reset = () => {
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");

  const insets = useSafeAreaInsets();

  const handleReset = async () => {};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { paddingTop: 48 + insets.top }]}>
          <Logo />
          <View style={{ marginTop: 24, marginBottom: 32 }}>
            <Heading>Reset password!</Heading>
            <Text
              style={[
                {
                  color: colors.secondary.light_grey,
                  textAlign: "center",
                  paddingVertical: 15,
                },
                fonts.regular_12,
              ]}
            >
              Enter a new password to restore access
            </Text>
          </View>
          <View style={{ gap: 48 }}>
            <View style={{ gap: 24 }}>
              <InputField
                placeholder="Enter new password"
                value={password}
                onChangeText={setPassword}
                isPassword
              />
              <InputField
                placeholder="Confirm new password"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                isPassword
              />
            </View>
            <Button title="Change password" onPress={handleReset} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: colors.main.black,
  },
});

export default Reset;
