import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: "Please provide your email", required_error: "Please provide your email" })
    .min(1, { message: "Please provide your email" })
    .email("Please provide a valid email"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
