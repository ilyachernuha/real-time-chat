import Fonts from "@/constants/Fonts";
import { Pressable, PressableProps, StyleSheet, Text, TextProps } from "react-native";
import { getActionColor } from "@/utils/getActionColor";

type TextButtonProps = TextProps & PressableProps;

export default function TextButton({ children, disabled, ...props }: TextButtonProps) {
  return (
    <Pressable style={styles.button} hitSlop={10} accessibilityRole="button" disabled={disabled} {...props}>
      {({ pressed }) => <Text style={[styles.text, { color: getActionColor({ pressed, disabled }) }]}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    zIndex: 2,
  },
  text: {
    ...Fonts[12],
  },
});
