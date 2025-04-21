import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { ForgotPasswordFormData, forgotPasswordSchema } from "@/features/auth/validators/forgotPasswordSchema";
import { useAutoResetForm } from "@/hooks/useAutoResetForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const useForgotPassworForm = () => {
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useAutoResetForm(reset);

  const { handleForgotPassword } = useForgotPassword();

  const submit = handleSubmit(async (data) => {
    const error = await handleForgotPassword(data);
    if (error) setError("email", { message: error });
  });

  return { control, submit, isSubmitting };
};
