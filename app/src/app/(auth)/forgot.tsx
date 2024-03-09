import Logo from "@/components/auth/Logo";
import { SafeAreaView, View } from "@/components/Themed";
import ForgotPasswordForm, { ForgotPasswordFormValues } from "@/components/auth/ForgotPasswordForm";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { isAxiosError } from "axios";
import { router } from "expo-router";
import { FormikHelpers } from "formik";
import { Alert } from "react-native";
import StyledText from "@/components/StyledText";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const onForgot = async (
    values: ForgotPasswordFormValues,
    { setSubmitting, setErrors }: FormikHelpers<ForgotPasswordFormValues>
  ) => {
    try {
      await forgotPassword(values.email);
      router.navigate(`/sent/${values.email}`);
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        setErrors({ email: error.response.data.detail });
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
          <View style={{ gap: 16, alignItems: "center" }}>
            <StyledText font="bold">Forgot password?</StyledText>
            <StyledText
              font="12"
              style={{ textAlign: "center" }}
              darkColor={Colors.dark.secondaryLightGrey}
              lightColor={Colors.dark.secondaryLightGrey}
            >
              Do not worry! Enter your email and{"\n"}we will reset the password!
            </StyledText>
          </View>
        </View>
        <ForgotPasswordForm onForgot={onForgot} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
