import Colors from "@/constants/Colors";
import { Regular14 } from "./StyledText";
import { SafeAreaView } from "./Themed";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";

interface Props {
  id: string;
}

const ChatHeader = ({ id }: Props) => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Ionicons name="filter-sharp" size={24} color={Colors.dark.mainPurple} style={{ padding: 10 }} />
        <Regular14>Chat id is {id}</Regular14>
        <MaterialIcons name="add-circle-outline" size={24} color={Colors.dark.mainPurple} style={{ padding: 10 }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: Colors.dark.mainDarkGrey,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default ChatHeader;
