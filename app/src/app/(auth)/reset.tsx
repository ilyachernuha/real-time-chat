import { Button } from "@/components/Buttons";
import InputField from "@/components/InputField";
import Logo from "@/components/Logo";
import { Bold, Regular12 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useState } from "react";

export default function Reset() {
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");

  const handleReset = async () => {};

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32 }}>
        <Bold style={{ textAlign: "center" }}>Reset password!</Bold>
        <Regular12
          style={{ textAlign: "center", paddingTop: 15 }}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          Enter a new password to restore access
        </Regular12>
      </View>
      <View style={{ gap: 48 }}>
        <View style={{ gap: 24 }}>
          <InputField placeholder="Enter new password" value={password} onChangeText={setPassword} isPassword />
          <InputField
            placeholder="Confirm new password"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            isPassword
          />
        </View>
        <Button title="Change password" onPress={handleReset} />
      </View>
    </SafeAreaView>
  );
}
