import { router } from "expo-router";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Logo from "@/components/auth/Logo";
import { useAuth } from "@/hooks/useAuth";
import { FormikHelpers } from "formik";
import { isAxiosError } from "axios";
import { Alert } from "react-native";
import GuestLoginForm, { GuestLoginFormValues } from "@/components/auth/GuestLoginForm";
import StyledText from "@/components/StyledText";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Guest() {
  const { guestLogin } = useAuth();

  const handleGuestLogin = async (
    values: GuestLoginFormValues,
    { setSubmitting, setErrors }: FormikHelpers<GuestLoginFormValues>
  ) => {
    try {
      await guestLogin(values.name);
      router.replace("/");
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        setErrors({ name: error.response.data.detail });
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
            <StyledText font="bold">Login as a guest!</StyledText>
            <StyledText
              font="12"
              style={{ paddingVertical: 15 }}
              darkColor={Colors.dark.secondaryLightGrey}
              lightColor={Colors.dark.secondaryLightGrey}
            >
              Please provide your name
            </StyledText>
          </View>
        </View>
        <GuestLoginForm onGuestLogin={handleGuestLogin} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
