import Colors from "@/constants/Colors";

type ButtonColorState = Partial<Record<"pressed" | "disabled", boolean | null>>;

export function getActionColor({ pressed, disabled }: ButtonColorState): string {
  if (!!disabled) return Colors.dark.secondaryLightGrey;
  if (!!pressed) return Colors.dark.secondaryBlue;
  return Colors.dark.mainPurple;
}

type ColorState = {
  value?: string;
  error?: string;
};

export function getColor({ value, error }: ColorState): string {
  if (!!error) return Colors.dark.mainErrorRed;
  if (!!value) return Colors.dark.text;
  return Colors.dark.secondaryLightGrey;
}

export function getBorderColor({ value, error}: ColorState): string {
  if (!!error) return Colors.dark.mainErrorRed;
  if (!!value) return Colors.dark.mainPurple;
  return Colors.dark.secondaryLightGrey;
}
