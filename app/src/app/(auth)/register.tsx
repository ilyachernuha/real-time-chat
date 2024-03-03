import { Link, router } from "expo-router";
import { Bold, Regular12 } from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { SafeAreaView, View } from "@/components/Themed";
import Logo from "@/components/auth/Logo";
import { useAuth } from "@/hooks/useAuth";
import RegistrationForm, { RegistrationFormValues } from "@/components/auth/RegistrationForm";
import { FormikHelpers } from "formik";
import { isAxiosError } from "axios";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Fonts from "@/constants/Fonts";
import { useEffect, useRef } from "react";

export default function Register() {
  const scrollViewRef = useRef<ScrollView>(null);

  const { signUp } = useAuth();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      scrollViewRef.current?.scrollToEnd();
    });

    // Optional: If you also want to adjust when the keyboard hides
    // const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
    //   // Handle keyboard hide if necessary
    // });

    return () => {
      keyboardDidShowListener.remove();
      // Optional: Clean up the hide listener
      // keyboardDidHideListener.remove();
    };
  }, []);

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
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled">
          <View style={{ paddingVertical: 48, paddingHorizontal: 24 }}>
            <Logo />
            <View style={{ marginBottom: 32 }}>
              <Bold style={{ textAlign: "center" }}>Create an account</Bold>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <Regular12
                  style={[{ textAlign: "center", right: -5.5 }]}
                  darkColor={Colors.dark.secondaryLightGrey}
                  lightColor={Colors.dark.secondaryLightGrey}
                >
                  I have an account!
                </Regular12>
                <Link
                  href="/login"
                  style={[{ color: Colors.dark.mainPurple, padding: 15, left: -5.5 }, Fonts.regular12]}
                >
                  Sign In!
                </Link>
              </View>
            </View>
            <RegistrationForm onRegister={handleRegister} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
