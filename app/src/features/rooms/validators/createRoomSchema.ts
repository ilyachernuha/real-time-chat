import { RoomLanguages } from "@/features/rooms/constants/RoomLanguages";
import { RoomThemes } from "@/features/rooms/constants/RoomThemes";
import { zEnumFromObject } from "@/utils/zEnumFromObject";
import { z } from "zod";

export const createRoomSchema = z.object({
  title: z.string().min(1, "Room title is too short").max(16, "Rooms title is too long"),
  description: z.string().max(200, "Room description is too long").optional(),
  theme: z.enum(RoomThemes, {
    required_error: "Room theme is required",
    invalid_type_error: "Invalid theme",
    message: "Please choose room theme",
  }),
  languages: z.array(zEnumFromObject(RoomLanguages)),
  tags: z.array(z.string()),
  make_public: z.boolean(),
});

export type CreateRoomFormData = z.infer<typeof createRoomSchema>;
