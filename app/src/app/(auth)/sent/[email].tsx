import Logo from "@/components/auth/Logo";
import { Bold, Regular12 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { Link, useLocalSearchParams } from "expo-router";

export default function EmailSent() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32, alignItems: "center" }}>
        <Bold style={{ textAlign: "center" }}>Follow the instructions</Bold>
        <Regular12
          style={{ textAlign: "center", paddingTop: 15 }}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          We have sent confirmation email to{"\n"}
          {email}
        </Regular12>
        <Link href="/forgot" style={[{ color: Colors.dark.mainPurple, padding: 15 }, Fonts.regular12]}>
          Change email
        </Link>
      </View>
    </SafeAreaView>
  );
}
