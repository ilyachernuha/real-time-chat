import CodeInput from "@/features/auth/screens/components/CodeInput";
import Logo from "@/components/Logo";
import Colors from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import StyledText from "@/components/StyledText";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import TextButton from "@/components/buttons/TextButton";
import { useConfirmEmail } from "@/features/auth/hooks/useConfirmEmail";

export const ConfirmEmailScreen = () => {
  const { email } = useLocalSearchParams();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { error, setError, handleConfirm, isSubmitting } = useConfirmEmail();

  return (
    <KeyboardAwareScrollView
      bottomOffset={50}
      contentContainerStyle={{ padding: 48 + insets.top, paddingHorizontal: 24 }}
      style={{ backgroundColor: Colors.dark.background }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: 24, alignItems: "center", marginBottom: 24 }}>
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
      <View style={{ marginBottom: 24 }}>
        <CodeInput onComplete={handleConfirm} error={error} setError={setError} isSubmitting={isSubmitting} />
      </View>
      <View style={{ alignItems: "center" }}>
        <TextButton onPress={() => router.back()}>Change email</TextButton>
      </View>
    </KeyboardAwareScrollView>
  );
};
