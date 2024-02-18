import { useState } from "react";
import { Link, router } from "expo-router";
import { Bold, Regular12 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";

import Logo from "@/components/Logo";
import InputField from "@/components/InputField";
import { Button, SecondaryButton } from "@/components/Buttons";
import Fonts from "@/constants/Fonts";
import { DividerWithText } from "@/components/Dividers";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [usernameError, setUsernameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const [hidePassword, setHidePassword] = useState(true);

  const { signIn, guestLogin } = useAuth();

  const handleUsernameChange = (text: string) => {
    text = text.trim();
    setUsername(text);
    if (text) {
      setUsernameError("");
    }
  };

  const handlePasswordChange = (text: string) => {
    text = text.trim();
    setPassword(text);
    if (text) {
      setPasswordError("");
    }
  };

  const handleLogin = async () => {
    let error = false;

    if (!username.trim()) {
      setUsernameError("Please provide your username");
      error = true;
    } else {
      setUsernameError("");
    }

    if (!password.trim()) {
      setPasswordError("Please provide your password");
      error = true;
    } else {
      setPasswordError("");
    }

    if (error) return;

    try {
      await signIn(username, password);
      router.replace("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setUsernameError(error.response.data.detail);
        }
      }
      console.error(error);
    }
  };

  const handleGuestLogin = async () => {
    if (!username.trim()) {
      setUsernameError("Please provide your username");
      return;
    } else {
      setUsernameError("");
    }
    try {
      await guestLogin(username);
      router.replace("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setUsernameError(error.response.data.detail);
        }
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32 }}>
        <Bold style={{ textAlign: "center" }}>Welcome back!</Bold>
        <Regular12
          style={[{ textAlign: "center", paddingVertical: 15 }]}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          Do not have an account?{" "}
          <Link href="/register" style={{ color: Colors.dark.mainPurple }}>
            Sign Up!
          </Link>
        </Regular12>
      </View>
      <View>
        <InputField
          placeholder="Enter your username"
          value={username}
          onChangeText={handleUsernameChange}
          error={usernameError}
        />
        <InputField
          placeholder="Enter your password"
          value={password}
          onChangeText={handlePasswordChange}
          isPassword
          error={passwordError}
          hidePassword={hidePassword}
          toggleHidePassword={() => setHidePassword(!hidePassword)}
        />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Link
          href="/forgot"
          style={[
            {
              color: Colors.dark.mainPurple,
              paddingHorizontal: 4,
              paddingVertical: 15,
              top: -24,
            },
            Fonts.regular12,
          ]}
        >
          Forgot password?
        </Link>
      </View>
      <View>
        <Button title="Sign In" onPress={handleLogin} />
        <DividerWithText text="or" />
        <SecondaryButton title="Log In as a Guest" onPress={handleGuestLogin} />
      </View>
    </SafeAreaView>
  );
}
