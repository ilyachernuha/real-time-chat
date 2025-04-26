import { useAuthStore } from "@/features/auth/services/authStore";
import { socket } from "@/lib/socket";

export const logout = () => {
  socket.disconnect();
  useAuthStore.getState().logout();
};
