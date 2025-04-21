import { z } from "zod";

export const passwordSchema = z
  .string({ message: "Password is required", required_error: "Password is required" })
  .min(1, { message: "Password is required" })
  .min(8, { message: "Password is too short" })
  .max(32, { message: "Password is too long" })
  .regex(/^[!-~]+$/, {
    message: "Spaces and non-English letters are not allowed",
  });
