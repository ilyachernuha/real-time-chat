import { router } from "expo-router";
import { Bold, Regular12 } from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Logo from "@/components/auth/Logo";
import { useAuth } from "@/hooks/useAuth";
import { FormikHelpers } from "formik";
import { isAxiosError } from "axios";
import { Alert } from "react-native";
import GuestLoginForm, { GuestLoginFormValues } from "@/components/auth/GuestLoginForm";

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
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
      <Logo />
      <View style={{ marginTop: 24, marginBottom: 32 }}>
        <Bold style={{ textAlign: "center" }}>Login as a guest!</Bold>
        <Regular12
          style={[{ textAlign: "center", padding: 15 }]}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          Please provide a username
        </Regular12>
      </View>
      <GuestLoginForm onGuestLogin={handleGuestLogin} />
    </SafeAreaView>
  );
}
