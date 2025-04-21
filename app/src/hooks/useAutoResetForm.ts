import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { UseFormReset } from "react-hook-form";

export const useAutoResetForm = (reset: UseFormReset<any>) => {
  useFocusEffect(
    useCallback(() => {
      return () => {
        reset();
      };
    }, [])
  );
};
