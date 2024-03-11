import { router } from "expo-router";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Logo from "@/components/auth/Logo";
import { useAuth } from "@/hooks/useAuth";
import LoginForm, { LoginFormValues } from "@/components/auth/LoginForm";
import { FormikHelpers } from "formik";
import { isAxiosError } from "axios";
import { Alert } from "react-native";
import { DividerWithText } from "@/components/Dividers";
import { SecondaryButton } from "@/components/Buttons";
import StyledText from "@/components/StyledText";
import Link from "@/components/Link";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Icons from "@/components/Icons";

const Login = () => {
  const { signIn } = useAuth();

  const onLogin = async (values: LoginFormValues, { setErrors, setSubmitting }: FormikHelpers<LoginFormValues>) => {
    try {
      await signIn(values);
      router.replace("/");
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        setErrors({ username: error.response.data.detail, password: " " });
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
                Do not have an account?
              </StyledText>
              <Link href="/register" style={{ paddingVertical: 15 }}>
                Sign Up!
              </Link>
            </View>
          </View>
        </View>
        <View>
          <LoginForm onLogin={onLogin} />
          <DividerWithText text="or" />
          <SecondaryButton title="Log In as a Guest" onPress={() => router.navigate("/guest")} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Login;
