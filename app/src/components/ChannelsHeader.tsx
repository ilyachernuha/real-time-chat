import Colors from "@/constants/Colors";
import { Regular14 } from "./StyledText";
import { SafeAreaView } from "./Themed";
import { StyleSheet, TextInput, View } from "react-native";
import Fonts from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const ChannelsHeader = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Ionicons name="filter-sharp" size={24} color={Colors.dark.mainPurple} style={{ padding: 10 }} />
          <Regular14>Channels</Regular14>
          <MaterialIcons name="add-circle-outline" size={24} color={Colors.dark.mainPurple} style={{ padding: 10 }} />
        </View>
        <View style={styles.input}>
          <TextInput
            style={[{ flex: 1, color: Colors.dark.text }, Fonts.regular14]}
            placeholderTextColor={Colors.dark.secondaryLightGrey}
            placeholder="Search"
            cursorColor={Colors.dark.text}
            autoCapitalize="none"
          />
          <MaterialIcons name="search" size={24} style={{ padding: 10 }} color={Colors.dark.secondaryLightGrey} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 2,
    height: 130,
    paddingTop: 8,
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
