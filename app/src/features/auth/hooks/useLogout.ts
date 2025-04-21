import { useAuthStore } from "@/features/auth/services/authStore";
import { db } from "@/index.native";
import { socket } from "@/lib/socket";
import { useCallback } from "react";

export const useLogout = () => {
  const logout = useCallback(async () => {
    try {
      socket.disconnect();

      useAuthStore.getState().logout();

      await db.write(async () => {
        await db.unsafeResetDatabase();
        // const collections = Object.values(db.collections.map);

        // for (const collection of collections) {
        //   await collection.query().destroyAllPermanently();
        // }
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return { logout };
};
