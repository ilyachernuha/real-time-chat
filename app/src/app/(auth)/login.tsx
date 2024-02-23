import { Link, router } from "expo-router";
import { Bold, Regular12 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import LoginForm, { LoginFormValues } from "@/components/auth/LoginForm";
import { FormikErrors, FormikHelpers, FormikTouched } from "formik";
import { isAxiosError } from "axios";
import { Alert } from "react-native";
import Fonts from "@/constants/Fonts";
import { DividerWithText } from "@/components/Dividers";
import { SecondaryButton } from "@/components/Buttons";

export default function Login() {
  const { signIn, guestLogin } = useAuth();

  const handleLogin = async (
    values: LoginFormValues,
    { setErrors, setSubmitting, setStatus }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      await signIn(values);
      router.replace("/");
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        Alert.alert("Validation Error", error.response.data.detail);
        // setErrors(error.response.data.errors);
      } else {
        Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
        // setStatus({ error: "An unexpected error occurred. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLogin = async (
    values: LoginFormValues,
    { setSubmitting, setFieldTouched, validateField, setFieldError }: FormikHelpers<LoginFormValues>,
    errors: FormikErrors<LoginFormValues>,
    touched: FormikTouched<LoginFormValues>
  ) => {
    setSubmitting(true);

    try {
      await guestLogin(values.username);
      router.replace("/");
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        Alert.alert("Validation Error", error.response.data.detail);
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
        <Bold style={{ textAlign: "center" }}>Welcome back!</Bold>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Regular12
            style={[{ textAlign: "center", right: -5.5 }]}
            darkColor={Colors.dark.secondaryLightGrey}
            lightColor={Colors.dark.secondaryLightGrey}
          >
            Don't have an account?
          </Regular12>
          <Link href="/register" style={[{ color: Colors.dark.mainPurple, padding: 15, left: -5.5 }, Fonts.regular12]}>
            Sign Up!
          </Link>
        </View>
      </View>
      <LoginForm onLogin={handleLogin} onGuestLogin={handleGuestLogin} />
      <DividerWithText text="or" />
      <SecondaryButton title="Log In as a Guest" onPress={() => router.navigate("/guest")} />
    </SafeAreaView>
  );
}
