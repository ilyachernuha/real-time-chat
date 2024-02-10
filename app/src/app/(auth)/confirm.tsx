import Logo from "@/components/Logo";
import { Bold, Regular14 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";

export default function Confirm() {
  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 151 }}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32 }}>
        <Bold style={{ textAlign: "center" }}>Confirm your email</Bold>
        <Regular14
          style={{ textAlign: "center", paddingVertical: 16 }}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          We have sent you an email! Confirm your email address to continue with your registration!
        </Regular14>
      </View>
    </SafeAreaView>
  );
}
