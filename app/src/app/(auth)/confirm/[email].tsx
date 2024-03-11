import CodeInput from "@/components/CodeInput";
import Logo from "@/components/auth/Logo";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import StyledText from "@/components/StyledText";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Link from "@/components/Link";

export default function Confirm() {
  const { confirm } = useAuth();
  const { email } = useLocalSearchParams();
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async (confirmationCode: string) => {
    if (confirmationCode.trim()) {
      setIsSubmitting(true);
      try {
        await confirm(confirmationCode);
        router.replace("/");
      } catch (error) {
        setError(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, gap: 32, alignItems: "center" }}
        >
          <View style={{ gap: 24, alignItems: "center", marginTop: 48 }}>
            <Logo />
            <View style={{ gap: 16, alignItems: "center" }}>
              <StyledText font="bold">Confirm your email</StyledText>
              <StyledText
                font="12"
                style={{ textAlign: "center" }}
                darkColor={Colors.dark.secondaryLightGrey}
                lightColor={Colors.dark.secondaryLightGrey}
              >
                We have sent you an email to {email}! Enter the confirmation code to continue registration!
              </StyledText>
            </View>
          </View>
          <CodeInput onComplete={handleConfirm} error={error} setError={setError} isSubmitting={isSubmitting} />
          <Link href={".."}>Change email</Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
