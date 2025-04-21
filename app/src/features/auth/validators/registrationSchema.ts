import { passwordSchema } from "@/features/auth/validators/passwordSchema";
import { usernameSchema } from "@/features/auth/validators/usernameSchema";
import { z } from "zod";

export const registrationSchema = z
  .object({
    email: z
      .string({ message: "Email is required", required_error: "Email is required" })
      .min(1, { message: "Email is required" })
      .email({ message: "Please provide a valid email" }),

    username: usernameSchema,

    password: passwordSchema,

    passwordConfirm: z
      .string({ message: "Please confirm your password", required_error: "Please confirm your password" })
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;
