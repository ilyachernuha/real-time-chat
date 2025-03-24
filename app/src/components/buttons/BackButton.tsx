import Fonts from "@/constants/Fonts";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";
import Icons from "../Icons";
import { PropsWithChildren } from "react";
import { getActionColor } from "@/utils/getActionColor";

export default function BackButton({ children, disabled, ...props }: PressableProps & PropsWithChildren) {
  return (
    <Pressable
      style={styles.button}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      disabled={disabled}
      {...props}
    >
      {({ pressed }) => (
        <>
          <Icons name="arrow-back" color={getActionColor({ pressed, disabled })} />
          <Text style={[styles.text, { color: getActionColor({ pressed, disabled }) }]}>{children}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    zIndex: 2,
  },
  text: {
    ...Fonts[12],
  },
});
