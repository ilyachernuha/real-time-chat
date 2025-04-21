import { useAuthStore } from "@/features/auth/services/authStore";
import { usersCollection } from "@/index.native";

export const getCurrentUser = async () => {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error("No current user ID");
  return await usersCollection.find(id);
};
