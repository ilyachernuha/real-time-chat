import { Link, router } from "expo-router";
import { Bold, Regular12 } from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { SafeAreaView, View } from "@/components/Themed";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import RegistrationForm, { RegistrationFormValues } from "@/components/auth/RegistrationForm";
import { FormikHelpers } from "formik";
import { isAxiosError } from "axios";
import { Alert } from "react-native";
import Fonts from "@/constants/Fonts";

export default function Register() {
  const { signUp } = useAuth();

  const handleRegister = async (
    values: RegistrationFormValues,
    { setErrors, setSubmitting }: FormikHelpers<RegistrationFormValues>
  ) => {
    try {
      await signUp(values);
      router.navigate(`/confirm/${values.email}`);
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
        <Bold style={{ textAlign: "center" }}>Create an account</Bold>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Regular12
            style={[{ textAlign: "center", right: -5.5 }]}
            darkColor={Colors.dark.secondaryLightGrey}
            lightColor={Colors.dark.secondaryLightGrey}
          >
            I have an account!
          </Regular12>
          <Link href="/login" style={[{ color: Colors.dark.mainPurple, padding: 15, left: -5.5 }, Fonts.regular12]}>
            Sign In!
          </Link>
        </View>
      </View>
      <RegistrationForm onRegister={handleRegister} />
    </SafeAreaView>
  );
}
