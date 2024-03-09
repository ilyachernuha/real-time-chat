import Logo from "@/components/auth/Logo";
import { Button } from "@/components/Buttons";
import Link from "@/components/Link";
import StyledText from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useLocalSearchParams, Link as DefaultLink } from "expo-router";

export default function EmailSent() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 48 }}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32, alignItems: "center" }}>
        <StyledText font="bold" style={{ textAlign: "center" }}>
          Follow the instructions
        </StyledText>
        <StyledText
          font="12"
          style={{ textAlign: "center", paddingTop: 15 }}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          We have sent confirmation email to{"\n"}
          {email}
        </StyledText>
        <Link href="/forgot" style={{ paddingVertical: 15 }}>
          Change email
        </Link>
      </View>
      <View style={{ flex: 1 }}></View>
      <DefaultLink href="/login" asChild>
        <Button title="Log In" />
      </DefaultLink>
    </SafeAreaView>
  );
}
