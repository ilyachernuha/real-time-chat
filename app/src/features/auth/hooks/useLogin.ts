import { authApi } from "@/features/auth/services/authApi";
import { useAuthStore } from "@/features/auth/services/authStore";
import { LoginFormData } from "@/features/auth/validators/loginSchema";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useLogin = () => {
  const { setAuthTokens, setUser, setSession } = useAuthStore((state) => state);
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    try {
      const response = await authApi.login(data);
      const { user_id, session_id, refresh_token, access_token } = response;
      setAuthTokens({ refreshToken: refresh_token, accessToken: access_token });
      setUser({ id: user_id });
      setSession(session_id);
      router.replace("/");
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        console.error(error.response.data);
        return error.response.data.detail;
      } else {
        Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
      }
    }
  };

  return { handleLogin };
};
