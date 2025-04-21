import { usernameSchema } from "@/features/auth/validators/usernameSchema";
import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string({ message: "Username or email is required", required_error: "Username or email is required" })
    .min(1, { message: "Username or email is required" })
    .refine(
      (val) => {
        const isUsername = usernameSchema.safeParse(val).success;
        const isEmail = z.string().email().safeParse(val).success;
        return isUsername || isEmail;
      },
      {
        message: "Please provide a valid username or email",
      }
    ),

  password: z
    .string({ message: "Password is required", required_error: "Password is required" })
    .min(1, { message: "Password is required" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
