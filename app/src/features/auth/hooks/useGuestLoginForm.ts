import { useGuestLogin } from "@/features/auth/hooks/useGuestLogin";
import { GuestLoginFormData, guestLoginSchema } from "@/features/auth/validators/guestLoginSchema";
import { useAutoResetForm } from "@/hooks/useAutoResetForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const useGuestLoginForm = () => {
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = useForm<GuestLoginFormData>({
    resolver: zodResolver(guestLoginSchema),
    defaultValues: {
      name: "",
    },
  });

  useAutoResetForm(reset);

  const { handleLogin } = useGuestLogin();

  const submit = handleSubmit(async (data) => {
    const error = await handleLogin(data);
    if (error) setError("name", { message: error });
  });

  return { control, submit, isSubmitting };
};
