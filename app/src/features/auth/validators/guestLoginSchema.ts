import { z } from "zod";

export const guestLoginSchema = z.object({
  name: z
    .string({
      message: "Name is required",
      required_error: "Name is required",
    })
    .trim()
    .min(1, "Name is required")
    .max(16, "Name is too long")
    .regex(/^[^\x00-\x1F\x7F]*$/, "Name cannot contain such characters"),
});

export type GuestLoginFormData = z.infer<typeof guestLoginSchema>;
