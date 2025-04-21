import { useRegister } from "@/features/auth/hooks/useRegister";
import { RegistrationFormData, registrationSchema } from "@/features/auth/validators/registrationSchema";
import { useAutoResetForm } from "@/hooks/useAutoResetForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const useRegistrationForm = () => {
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useAutoResetForm(reset);

  const { handleRegister } = useRegister();

  const submit = handleSubmit(async (data) => {
    const result = await handleRegister(data);

    if (!result.success && result.field && result.message) {
      setError(result.field, {
        type: "manual",
        message: result.message,
      });
    }
  });

  return { control, submit, isSubmitting };
};
