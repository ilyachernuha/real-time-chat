import Button from "@/components/Button";
import InputField from "@/components/InputField";
import Logo from "@/components/Logo";
import { Bold, Regular12 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");

  const handleReset = async () => {
    router.navigate("/reset");
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32 }}>
        <Bold style={{ textAlign: "center" }}>Forgot password?</Bold>
        <Regular12
          style={{ textAlign: "center", paddingTop: 15 }}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          Do not excite! Enter your email and{"\n"}we will reset password!
        </Regular12>
      </View>
      <View style={{ gap: 48 }}>
        <View style={{ gap: 24 }}>
          <InputField placeholder="Enter your email" value={email} onChangeText={setEmail} />
        </View>
        <Button title="Reset" onPress={handleReset} />
      </View>
    </SafeAreaView>
  );
}
