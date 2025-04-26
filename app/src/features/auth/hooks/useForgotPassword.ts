import { authApi } from "@/features/auth/services/authApi";
import { ForgotPasswordFormData } from "@/features/auth/validators/forgotPasswordSchema";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useForgotPassword = () => {
  const router = useRouter();

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      await authApi.forgotPassword(data.email);
      router.navigate(`/sent/${data.email}`);
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        return error.response.data.detail;
      } else {
        Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
      }
    }
  };

  return { handleForgotPassword };
};
