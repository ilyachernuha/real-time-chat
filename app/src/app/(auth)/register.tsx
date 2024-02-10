import { useState } from "react";
import { Link, router } from "expo-router";
import { Bold, Regular12 } from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { SafeAreaView, View } from "@/components/Themed";
import Logo from "@/components/Logo";
import InputField from "@/components/InputField";
import { Button } from "@/components/Buttons";
import { useSession } from "@/providers/AuthProvider";

export default function Register() {
  const { signUp, applicationId } = useSession();

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");

  const onRegister = async () => {
    if (username.trim()) {
      const applicationId = await signUp(username, email, password);
      // Navigate after signing in. You may want to tweak this to ensure sign-in is
      // successful before navigating.
      if (applicationId) {
        router.navigate("/confirm");
      } else {
        // Handle sign-in failure (e.g., display an error message)
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
      <View style={{ gap: 48 }}>
        <View style={{ gap: 24 }}>
          <InputField placeholder="Enter your email" value={email} onChangeText={setEmail} />
          <InputField placeholder="Enter your username" value={username} onChangeText={setUsername} />
          <InputField placeholder="Enter your password" value={password} onChangeText={setPassword} isPassword />
          <InputField
            placeholder="Confirm your password"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            isPassword
          />
        </View>
        <Button title="Create an account" onPress={onRegister} />
      </View>
    </SafeAreaView>
  );
}
