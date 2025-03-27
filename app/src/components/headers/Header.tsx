import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type HeaderProps = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
};

export default function Header({ title, left, right, style }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }, style]}>
      <View style={styles.container}>
        <View style={styles.side}>{left}</View>
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.side}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.dark.mainDarkGrey,
  },
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  side: {
    flex: 1,
    justifyContent: "center",
  },
  center: {
    flex: 2,
    alignItems: "center",
  },
  title: {
    color: Colors.dark.text,
    ...Fonts[14],
  },
});
