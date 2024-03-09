import Colors from "@/constants/Colors";
import { SafeAreaView } from "./Themed";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import icon from "../../assets/images/icon.png";
import StyledText from "./StyledText";

interface Props {
  id: string;
}

const ChatHeader = ({ id }: Props) => {
  return (
    <SafeAreaView>
      <View style={{ backgroundColor: Colors.dark.mainDarkGrey, justifyContent: "center" }}>
        <View style={{ position: "absolute", width: "100%" }}>
          <StyledText font="14" style={{ textAlign: "center" }}>
            Chat id is {id}
          </StyledText>
        </View>
        <View
          style={{
            paddingVertical: 8,
            paddingHorizontal: 24,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Link href="/(tabs)" asChild>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MaterialIcons name="arrow-back-ios-new" size={24} color={Colors.dark.mainPurple} />
              <StyledText font="12" darkColor={Colors.dark.mainPurple} lightColor={Colors.dark.mainPurple}>
                Back
              </StyledText>
            </Pressable>
          </Link>
          <Image source={icon} width={44} height={44} style={{ width: 44, height: 44, borderRadius: 12 }} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatHeader;
