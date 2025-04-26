import { useLogin } from "@/features/auth/hooks/useLogin";
import { LoginFormData, loginSchema } from "@/features/auth/validators/loginSchema";
import { useAutoResetForm } from "@/hooks/useAutoResetForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const useLoginForm = () => {
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useAutoResetForm(reset);

  const { handleLogin } = useLogin();

  const submit = handleSubmit(async (data) => {
    const error = await handleLogin(data);
    if (error) {
      setError("username", { message: error });
      setError("password", { message: " " });
    }
  });

  return { control, submit, isSubmitting };
};
