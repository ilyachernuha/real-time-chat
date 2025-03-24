import Colors from "@/constants/Colors";

type ColorState = Partial<Record<"pressed" | "disabled", boolean | null>>;

export function getActionColor({ pressed, disabled }: ColorState): string {
  if (!!disabled) return Colors.dark.secondaryLightGrey;
  if (!!pressed) return Colors.dark.secondaryBlue;
  return Colors.dark.mainPurple;
}
