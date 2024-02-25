import CodeInput from "@/components/CodeInput";
import Logo from "@/components/Logo";
import { Bold, Regular14 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function Confirm() {
  const { confirm } = useAuth();

  const { email } = useLocalSearchParams();

  const [error, setError] = useState(false);

  const handleConfirm = async (confirmationCode: string) => {
    if (confirmationCode.trim()) {
      try {
        await confirm(confirmationCode);
        router.replace("/");
      } catch (error) {
        setError(true);
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
          We have sent an email to {email}! Enter the confirmation code to continue registration!
        </Regular14>
        <CodeInput onComplete={handleConfirm} error={error} setError={setError} />
      </View>
    </SafeAreaView>
  );
}
