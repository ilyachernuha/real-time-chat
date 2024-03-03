import Logo from "@/components/auth/Logo";
import { Bold, Regular12 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import ForgotPasswordForm, { ForgotPasswordFormValues } from "@/components/auth/ForgotPasswordForm";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { isAxiosError } from "axios";
import { router } from "expo-router";
import { FormikHelpers } from "formik";
import { Alert } from "react-native";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const handleForgot = async (
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
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32 }}>
        <Bold style={{ textAlign: "center" }}>Forgot password?</Bold>
        <Regular12
          style={{ textAlign: "center", paddingTop: 15 }}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          Do not worry! Enter your email and{"\n"}we will reset the password!
        </Regular12>
      </View>
      <ForgotPasswordForm onReset={handleForgot} />
    </SafeAreaView>
  );
}
