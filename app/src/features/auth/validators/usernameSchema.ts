import { z } from "zod";

export const usernameSchema = z
  .string({ message: "Username is required", required_error: "Username is required" })
  .min(1, "Username is required")
  .min(2, { message: "Username is too short" })
  .max(24, { message: "Username is too long" })
  .regex(/^[a-zA-Z0-9]+$/, { message: "Only English letters and numbers are allowed" });
