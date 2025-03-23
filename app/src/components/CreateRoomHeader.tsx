import { useRouter } from "expo-router";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icons from "./Icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";

export default function CreateRoomHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          {({ pressed }) => (
            <>
              <Icons color={pressed ? Colors.dark.secondaryBlue : Colors.dark.mainPurple} name="arrow-back" />
              <Text style={[styles.backText, { color: pressed ? Colors.dark.secondaryBlue : Colors.dark.mainPurple }]}>
                Back
              </Text>
            </>
          )}
        </Pressable>
        <Text style={styles.title}>Create Room</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: Colors.dark.mainDarkGrey,
  },
  headerContainer: {
    height: 60,
    justifyContent: "center",
    paddingInline: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    zIndex: 2,
  },
  backText: {
    ...Fonts[12],
  },
  title: {
    position: "absolute",
    alignSelf: "center",
    color: Colors.dark.text,
    zIndex: 1,
    ...Fonts[14],
  },
});
