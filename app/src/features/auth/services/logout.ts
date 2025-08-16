import { useAuthStore } from "@/features/auth/services/authStore";

export const logout = () => {
    useAuthStore.getState().logout();
};
