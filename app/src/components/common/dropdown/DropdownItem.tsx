import Icons from "@/components/Icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { Text, PressableProps, Pressable, StyleSheet } from "react-native";

type DropdownItemProps = PressableProps & {
  label: string;
  isChosen?: boolean;
};

export default function DropdownItem({ label, isChosen, ...props }: DropdownItemProps) {
  return (
    <Pressable style={styles.container} {...props}>
      <Text style={styles.text}>{label}</Text>
      {isChosen && <Icons name="done" color={Colors.dark.mainPurple} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    color: Colors.dark.text,
    ...Fonts[14],
  },
});
