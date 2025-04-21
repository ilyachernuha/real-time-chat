import { authApi } from "@/features/auth/services/authApi";
import { useAuthStore } from "@/features/auth/services/authStore";
import { resetPasswordFormData } from "@/features/auth/validators/resetPasswordSchema";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";

export const useResetPassword = () => {
  const { setAuthTokens, setUser, setSession } = useAuthStore((state) => state);
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const handleResetPassword = async (data: resetPasswordFormData) => {
    try {
      const response = await authApi.resetPassword({ application_id: token, new_password: data.password });
      const { status } = response;
      // setAuthTokens({ refreshToken: refresh_token, accessToken: access_token });
      // setUser({ id: user_id });
      // setSession(session_id);
      router.replace("/");
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        return error.response.data.detail;
      } else {
        Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
      }
    }
  };

  return { handleResetPassword };
};
