import Colors from "@/constants/Colors";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Fonts from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "./StyledText";
import { useRouter } from "expo-router";

const ChannelsHeader = ({ top }: { top: number }) => {
  const router = useRouter();

  return (
    <>
      <View style={{ paddingTop: top, ...styles.container }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Ionicons name="filter-sharp" size={24} color={Colors.dark.mainPurple} style={{ padding: 10 }} />
          <StyledText font="14">Channels</StyledText>
          <Pressable onPress={() => router.push("/create-room")}>
            <MaterialIcons name="add-circle-outline" size={24} color={Colors.dark.mainPurple} style={{ padding: 10 }} />
          </Pressable>
        </View>
        <View style={styles.input}>
          <TextInput
            style={[{ flex: 1, color: Colors.dark.text }, Fonts[14]]}
            placeholderTextColor={Colors.dark.secondaryLightGrey}
            placeholder="Search"
            cursorColor={Colors.dark.text}
            autoCapitalize="none"
          />
          <MaterialIcons name="search" size={24} style={{ padding: 10 }} color={Colors.dark.secondaryLightGrey} />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 16,
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
