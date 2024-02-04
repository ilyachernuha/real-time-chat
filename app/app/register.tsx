import { useState } from "react";
import { useDispatch } from "react-redux";
import authService from "../src/services/authService";
import { setCurrentUser } from "../src/store/chatSlice";
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
import { Link, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Register = () => {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const dispatch = useDispatch();

  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    router.navigate("/confirm");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { paddingTop: 48 + insets.top }]}>
          <Logo />
          <View style={{ marginTop: 24, marginBottom: 32 }}>
            <Heading>Create an account</Heading>
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
              I have an account!{" "}
              <Link
                href="/login"
                style={{
                  color: colors.main.blue,
                }}
              >
                Sign In!
              </Link>
            </Text>
          </View>
          <View style={{ gap: 48 }}>
            <View style={{ gap: 24 }}>
              <InputField
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
              />
              <InputField
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
              />
              <InputField
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword
              />
              <InputField
                placeholder="Confirm your password"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                isPassword
              />
            </View>
            <Button title="Create an account" onPress={handleRegister} />
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

export default Register;
