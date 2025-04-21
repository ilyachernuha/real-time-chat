import Logo from "@/components/Logo";
import { Button } from "@/components/buttons/Buttons";
import StyledText from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useLocalSearchParams, Link as DefaultLink, useRouter } from "expo-router";
import TextButton from "@/components/buttons/TextButton";

export default function EmailSent() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 48 }}>
      <View style={{ alignItems: "center" }}>
        <Logo />
      </View>
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
        <TextButton style={{ paddingVertical: 15 }} onPress={() => router.back()}>
          Change email
        </TextButton>
      </View>
      <View style={{ flex: 1 }}></View>
      <Button title="Log In" onPress={() => router.replace("/")} />
    </SafeAreaView>
  );
}
