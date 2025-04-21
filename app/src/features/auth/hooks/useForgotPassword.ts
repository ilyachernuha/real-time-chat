import { authApi } from "@/features/auth/services/authApi";
import { useAuthStore } from "@/features/auth/services/authStore";
import { ForgotPasswordFormData } from "@/features/auth/validators/forgotPasswordSchema";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useForgotPassword = () => {
  const { setAuthTokens, setUser, setSession } = useAuthStore((state) => state);
  const router = useRouter();

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      const response = await authApi.forgotPassword(data.email);
      const { status } = response;
      // setAuthTokens({ refreshToken: refresh_token, accessToken: access_token });
      // setUser({ id: user_id });
      // setSession(session_id);
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
