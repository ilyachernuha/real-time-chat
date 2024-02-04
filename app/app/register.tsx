import { useState } from "react";
import { useDispatch } from "react-redux";
import authService from "../src/services/authService";
import { setCurrentUser } from "../src/store/chatSlice";
import { View, Text, StyleSheet } from "react-native";
import Logo from "../src/components/Logo";
import Heading from "../src/components/UI/Heading";
import InputField from "../src/components/UI/InputField";
import Button from "../src/components/UI/Button";
import { colors } from "../src/config/theme";
import { Link, Stack } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const Register = () => {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const dispatch = useDispatch();

  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (username.trim()) {
      try {
        const user = await authService.login(username);
        dispatch(setCurrentUser(user));
        // Navigate to chat screen or elsewhere as needed
      } catch (error) {
        console.error(error);
        // Handle login error (e.g., show error message)
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: 48 + insets.top }]}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32 }}>
        <Heading>Create an account</Heading>
        <Text
          style={{
            color: colors.secondary.light_grey,
            textAlign: "center",
            paddingVertical: 15,
          }}
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
        <Button title="Create an account" onPress={handleLogin} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    backgroundColor: colors.main.black,
  },
});

export default Register;
