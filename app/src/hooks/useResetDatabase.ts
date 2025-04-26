import { resetDatabase } from "@/index.native";
import { useEffect } from "react";

export const useResetDatabase = () => {
  useEffect(() => {
    return () => {
      resetDatabase();
    };
  }, []);
};
