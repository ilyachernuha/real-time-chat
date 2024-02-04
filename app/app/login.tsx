import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Logo from "../src/components/Logo";
import Heading from "../src/components/UI/Heading";
import InputField from "../src/components/UI/InputField";
import Button from "../src/components/UI/Button";
import { colors, fonts } from "../src/config/theme";
import { Link, router } from "expo-router";
import { useSession } from "../src/ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const insets = useSafeAreaInsets();

  const { signIn } = useSession();

  const handleLogin = async () => {
    if (username.trim()) {
      const success = await signIn(username);
      // Navigate after signing in. You may want to tweak this to ensure sign-in is
      // successful before navigating.
      if (success) {
        router.replace("/");
      } else {
        // Handle sign-in failure (e.g., display an error message)
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: 48 + insets.top }]}>
        <Logo />
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Heading>Welcome back!</Heading>
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
            Do not have an account?{" "}
            <Link
              href="/register"
              style={{
                color: colors.main.blue,
              }}
            >
              Sign Up!
            </Link>
          </Text>
        </View>
        <View style={{ gap: 48 }}>
          <View style={{ gap: 24 }}>
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
          </View>
          <Button title="Sign In" onPress={handleLogin} />
        </View>
        <Link
          href="/forgot"
          style={[
            {
              color: colors.main.blue,
              textAlign: "center",
              paddingVertical: 15,
            },
            fonts.regular_12,
          ]}
        >
          Forgot password?
        </Link>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: colors.main.black,
  },
});

export default Login;
