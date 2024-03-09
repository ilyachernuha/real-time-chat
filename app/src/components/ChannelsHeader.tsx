import Colors from "@/constants/Colors";
import { SafeAreaView } from "./Themed";
import { StyleSheet, TextInput, View } from "react-native";
import Fonts from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "./StyledText";

const ChannelsHeader = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Ionicons name="filter-sharp" size={24} color={Colors.dark.mainPurple} style={{ padding: 10 }} />
        <StyledText font="14">Channels</StyledText>
        <MaterialIcons name="add-circle-outline" size={24} color={Colors.dark.mainPurple} style={{ padding: 10 }} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
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
