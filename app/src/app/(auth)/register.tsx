import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { SafeAreaView, View } from "@/components/Themed";
import Logo from "@/components/auth/Logo";
import { useAuth } from "@/hooks/useAuth";
import RegistrationForm, { RegistrationFormValues } from "@/components/auth/RegistrationForm";
import { FormikHelpers } from "formik";
import { isAxiosError } from "axios";
import { Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Link from "@/components/Link";
import StyledText from "@/components/StyledText";

export default function Register() {
  const { signUp } = useAuth();

  const onRegister = async (
    values: RegistrationFormValues,
    { setSubmitting }: FormikHelpers<RegistrationFormValues>
  ) => {
    try {
      await signUp(values);
      router.navigate(`/confirm/${values.email}`);
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        Alert.alert("Validation Error", error.response.data.detail);
      } else {
        Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        enableOnAndroid
        contentContainerStyle={{ paddingHorizontal: 24, gap: 32 }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={48}
      >
        <View style={{ gap: 24, alignItems: "center", marginTop: 48 }}>
          <Logo />
          <View style={{ gap: 2, alignItems: "center" }}>
            <StyledText font="bold">Create an account</StyledText>
            <View style={{ flexDirection: "row", gap: 4, alignItems: "center", justifyContent: "center" }}>
              <StyledText
                font="12"
                darkColor={Colors.dark.secondaryLightGrey}
                lightColor={Colors.dark.secondaryLightGrey}
              >
                I have an account!
              </StyledText>
              <Link href="/login" style={{ paddingVertical: 15 }}>
                Sign In!
              </Link>
            </View>
          </View>
        </View>
        <RegistrationForm onRegister={onRegister} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
