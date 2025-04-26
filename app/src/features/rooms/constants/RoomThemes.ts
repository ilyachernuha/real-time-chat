export const RoomThemes = ["art", "work", "education", "entertainment", "other"] as const;

export type RoomTheme = (typeof RoomThemes)[number];

export const themeOptions = RoomThemes.map((theme) => ({
  label: theme[0].toUpperCase() + theme.slice(1),
  optionValue: theme,
}));
