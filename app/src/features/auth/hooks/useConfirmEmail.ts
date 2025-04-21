import { authApi } from "@/features/auth/services/authApi";
import { useAuthStore } from "@/features/auth/services/authStore";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export const useConfirmEmail = () => {
  const router = useRouter();

  const setAuthTokens = useAuthStore((state) => state.setAuthTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const emailApplicationId = useAuthStore((state) => state.emailApplicationId);

  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async (confirmationCode: string) => {
    if (!emailApplicationId) {
      router.back();
      return;
    }

    if (confirmationCode.trim()) {
      setIsSubmitting(true);
      try {
        const response = await authApi.verifyCode({
          application_id: emailApplicationId,
          confirmation_code: confirmationCode,
        });
        const { access_token, refresh_token, session_id, user_id } = response;
        setAuthTokens({
          accessToken: access_token,
          refreshToken: refresh_token,
        });
        setUser({ id: user_id });
        setSession(session_id);
        router.replace("/");
      } catch (error) {
        if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
          console.error(error.response.data);
          // return error.response.data.detail;
        } else {
          Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
        }
        setError(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return { handleConfirm, error, setError, isSubmitting };
};
