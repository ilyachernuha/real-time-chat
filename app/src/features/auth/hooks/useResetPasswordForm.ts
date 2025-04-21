import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import { resetPasswordFormData, resetPasswordSchema } from "@/features/auth/validators/resetPasswordSchema";
import { useAutoResetForm } from "@/hooks/useAutoResetForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const useResetPasswordForm = () => {
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = useForm<resetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  useAutoResetForm(reset);

  const { handleResetPassword } = useResetPassword();

  const submit = handleSubmit(async (data) => {
    const error = await handleResetPassword(data);
    if (error) setError("password", { message: error });
  });

  return { control, submit, isSubmitting };
};
