import Colors from "@/constants/Colors";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Fonts from "@/constants/Fonts";
import StyledText from "./StyledText";
import Icons from "./Icons";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  onPressCreate?: () => void;
}

const ChannelsHeader = ({ onPressCreate }: Props) => {
  return (
    <SafeAreaView edges={["top", "right", "left"]}>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable style={{ padding: 10 }} onPress={onPressCreate}>
            {({ pressed }) => (
              <Icons name="filter" size={24} color={Colors.dark[pressed ? "secondaryBlue" : "mainPurple"]} />
            )}
          </Pressable>
          <StyledText font="14">Channels</StyledText>
          <Link href="/create" asChild>
            <Pressable style={{ padding: 10 }}>
              {({ pressed }) => (
                <Icons name="add" size={24} color={Colors.dark[pressed ? "secondaryBlue" : "mainPurple"]} />
              )}
            </Pressable>
          </Link>
        </View>
        <View style={styles.input}>
          <TextInput
            style={[{ flex: 1, color: Colors.dark.text }, Fonts[14]]}
            placeholderTextColor={Colors.dark.secondaryLightGrey}
            placeholder="Search"
            cursorColor={Colors.dark.text}
            autoCapitalize="none"
          />
          <Icons name="search" size={24} style={{ padding: 10 }} color={Colors.dark.secondaryLightGrey} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: Colors.dark.mainDarkGrey,
    gap: 12,
  },
  input: {
    height: 44,
    paddingLeft: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colors.dark.secondaryLightGrey,
    backgroundColor: Colors.dark.background,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChannelsHeader;
