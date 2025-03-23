export const RoomThemes = ["art", "work", "education", "entertainment", "other"] as const;

export type RoomTheme = (typeof RoomThemes)[number];
