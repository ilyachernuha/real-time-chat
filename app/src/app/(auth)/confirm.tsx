import CodeInput from "@/components/CodeInput";
import Logo from "@/components/Logo";
import { Bold, Regular14 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";

export default function Confirm() {
  const { confirm } = useAuth();

  const handleConfirm = async (confirmationCode: string) => {
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
        <CodeInput onComplete={handleConfirm} />
      </View>
    </SafeAreaView>
  );
}
