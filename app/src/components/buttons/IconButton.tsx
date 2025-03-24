import { Pressable, PressableProps, StyleSheet } from "react-native";
import Icons, { IconProps } from "../Icons";
import { getActionColor } from "@/utils/getActionColor";

type IconButtonProps = IconProps & PressableProps;

export default function IconButton({ children, disabled, name, size = 24, ...props }: IconButtonProps) {
  const iconProps: IconProps = { name, size };
  return (
    <Pressable style={styles.button} hitSlop={10} accessibilityRole="button" disabled={disabled} {...props}>
      {({ pressed }) => <Icons color={getActionColor({ pressed, disabled })} {...iconProps} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    zIndex: 2,
    padding: 10
  },
});
