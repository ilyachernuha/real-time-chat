import { passwordSchema } from "@/features/auth/validators/passwordSchema";
import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,

    passwordConfirm: z
      .string({
        message: "Please confirm your password",
        required_error: "Please confirm your password",
      })
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords do not match",
  });

export type resetPasswordFormData = z.infer<typeof resetPasswordSchema>;
