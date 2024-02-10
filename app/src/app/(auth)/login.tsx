import { useState } from "react";
import { Link, router } from "expo-router";
import { Bold, Regular12 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useSession } from "@/providers/AuthProvider";
import Logo from "@/components/Logo";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import Fonts from "@/constants/Fonts";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { session, signIn } = useSession();

  const handleLogin = async () => {
    if (username.trim()) {
      const token = await signIn(username, password);
      // Navigate after signing in. You may want to tweak this to ensure sign-in is
      // successful before navigating.
      if (token) {
        router.replace("/");
      } else {
        // Handle sign-in failure (e.g., display an error message)
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
      <View style={{ gap: 48 }}>
        <View style={{ gap: 24 }}>
          <InputField placeholder="Enter your username" value={username} onChangeText={setUsername} isUsername />
          <InputField placeholder="Enter your password" value={password} onChangeText={setPassword} isPassword />
        </View>
        <Button title="Sign In" onPress={handleLogin} />
      </View>
      <Link
        href="/forgot"
        style={[{ color: Colors.dark.mainPurple, textAlign: "center", paddingVertical: 15 }, Fonts.regular12]}
      >
        Forgot password?
      </Link>
    </SafeAreaView>
  );
}
