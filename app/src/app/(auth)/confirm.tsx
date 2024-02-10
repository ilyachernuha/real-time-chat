import Button from "@/components/Button";
import InputField from "@/components/InputField";
import Logo from "@/components/Logo";
import { Bold, Regular14 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useSession } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { useState } from "react";

export default function Confirm() {
  const { confirm } = useSession();

  const [confirmationCode, setConfirmationCode] = useState("");

  const onConfirm = async () => {
    if (confirmationCode.trim()) {
      const token = await confirm(confirmationCode);
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
        <Bold style={{ textAlign: "center" }}>Confirm your email</Bold>
        <Regular14
          style={{ textAlign: "center", paddingVertical: 16 }}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          We have sent you an email! Enter the confirmation code to continue registration!
        </Regular14>
        <InputField onChangeText={setConfirmationCode} placeholder="Confirmation Code" value={confirmationCode} />
      </View>
      <Button title="Confirm" onPress={onConfirm} />
    </SafeAreaView>
  );
}
