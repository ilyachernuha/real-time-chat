import Logo from "@/components/auth/Logo";
import StyledText from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import ResetPasswordForm, { ResetPasswordFormValues } from "@/components/auth/ResetPasswordForm";
import { FormikHelpers } from "formik";
import { useAuth } from "@/hooks/useAuth";
import { isAxiosError } from "axios";
import { Alert } from "react-native";

export default function Reset() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { resetPassword } = useAuth();

  const onReset = async (
    values: ResetPasswordFormValues,
    { setErrors, setSubmitting }: FormikHelpers<ResetPasswordFormValues>
  ) => {
    try {
      await resetPassword({ application_id: token, new_password: values.password });
      router.replace("/");
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        // Alert.alert("Validation Error", error.response.data.detail);
        // setErrors(error.response.data.errors);
      } else {
        Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
        // setStatus({ error: "An unexpected error occurred. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32 }}>
        <StyledText font="bold" style={{ textAlign: "center" }}>
          Reset password!
        </StyledText>
        <StyledText
          font="12"
          style={{ textAlign: "center", paddingTop: 15 }}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          Enter a new password to restore access
        </StyledText>
      </View>
      <ResetPasswordForm onReset={onReset} />
    </SafeAreaView>
  );
}
