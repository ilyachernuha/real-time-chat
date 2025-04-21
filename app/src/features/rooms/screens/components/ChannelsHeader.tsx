import Colors from "@/constants/Colors";
import { StyleSheet, TextInput, View } from "react-native";
import Fonts from "@/constants/Fonts";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/components/StyledText";
import { useRouter } from "expo-router";
import IconButton from "@/components/buttons/IconButton";

const ChannelsHeader = ({ top }: { top: number }) => {
  const router = useRouter();

  return (
    <>
      <View style={{ paddingTop: top, ...styles.container }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <IconButton name="filter" onPress={() => {}} />
          <StyledText font="14">Channels</StyledText>
          <IconButton name="add" onPress={() => router.push("/create-room")} />
        </View>
        <View style={styles.input}>
          <TextInput
            // onChangeText={handleSearch}
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
