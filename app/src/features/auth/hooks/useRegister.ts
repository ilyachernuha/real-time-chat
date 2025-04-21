import { authApi } from "@/features/auth/services/authApi";
import { useAuthStore } from "@/features/auth/services/authStore";
import { RegistrationFormData } from "@/features/auth/validators/registrationSchema";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useRegister = () => {
  const router = useRouter();

  const setEmailApplicationId = useAuthStore((state) => state.setEmailApplicationId);

  const handleRegister = async (data: RegistrationFormData) => {
    try {
      const response = await authApi.register(data);
      const { application_id, status } = response;
      setEmailApplicationId(application_id);
      router.navigate(`/confirm-email/${data.email}`);
      return { success: true };
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.detail) {
        console.error(error.response.data);
        const { field, detail } = error.response.data;
        return {
          success: false,
          field: field,
          message: detail,
        };
      }
      Alert.alert("Unexpected Error", "Something went wrong. Please try again.");
      return { success: false };
    }
  };

  return { handleRegister };
};
