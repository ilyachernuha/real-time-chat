import { useState } from "react";
import { Link, router } from "expo-router";
import { Bold, Regular12 } from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { SafeAreaView, View } from "@/components/Themed";
import Logo from "@/components/Logo";
import InputField from "@/components/InputField";
import { Button } from "@/components/Buttons";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

export default function Register() {
  const { signUp, applicationId } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");

  const [emailError, setEmailError] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [passwordConfirmError, setPasswordConfirmError] = useState<string>("");

  const handleEmailChange = (text: string) => {
    text = text.trim();
    setEmail(text);
    if (text) {
      setEmailError("");
    }
  };

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

  const handlePasswordConfirmChange = (text: string) => {
    text = text.trim();
    setPasswordConfirm(text);
    if (text) {
      setPasswordConfirmError("");
    }
  };

  const handleRegister = async () => {
    let error = false;

    if (!email.trim()) {
      setEmailError("Please provide your email");
      error = true;
    } else {
      setEmailError("");
    }

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

    if (!passwordConfirm.trim()) {
      setPasswordConfirmError("Please confirm your password");
      error = true;
    } else if (password.trim() !== passwordConfirm.trim()) {
      setPasswordConfirmError("Passwords do not match");
      error = true;
    } else {
      setPasswordConfirmError("");
    }

    if (error) return;

    try {
      await signUp(username, email, password);
      router.navigate("/confirm");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const detail = error.response.data.detail;
          if (typeof detail === "string") {
            const firstWord = detail.split(" ")[0].toLowerCase();
            if (firstWord === "username") {
              setUsernameError(detail);
            } else if (firstWord === "password") {
              setPasswordError(detail);
            } else {
              setEmailError(detail);
            }
          } else {
            setEmailError("Provided email is not valid");
          }
        }
      } else {
        setEmailError("Unexpected error");
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32 }}>
        <Bold style={{ textAlign: "center" }}>Create an account</Bold>
        <Regular12
          style={[
            {
              textAlign: "center",
              paddingVertical: 15,
            },
          ]}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          I have an account!{" "}
          <Link href="/login" style={{ color: Colors.dark.mainPurple }}>
            Sign In!
          </Link>
        </Regular12>
      </View>
      <View style={{ gap: 24 }}>
        <View>
          <InputField
            placeholder="Enter your email"
            value={email}
            onChangeText={handleEmailChange}
            error={emailError}
          />
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
          />
          <InputField
            placeholder="Confirm your password"
            value={passwordConfirm}
            onChangeText={handlePasswordConfirmChange}
            isPassword
            error={passwordConfirmError}
          />
        </View>
        <Button title="Create an account" onPress={handleRegister} />
      </View>
    </SafeAreaView>
  );
}
