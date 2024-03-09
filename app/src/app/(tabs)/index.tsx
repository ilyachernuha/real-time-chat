import { View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { FlatList, Image, ListRenderItem, StyleSheet, TouchableOpacity } from "react-native";
import icon from "../../../assets/images/icon.png";
import { Link } from "expo-router";
import StyledText from "@/components/StyledText";

interface Chat {
  id: string;
  title: string;
  message: string;
  time: string;
  messagesCount: number;
}

const data: Chat[] = [
  { id: "1", title: "Whisper Community", message: "No messages yet", time: "12:23", messagesCount: 100 },
  { id: "2", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "3", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "4", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "5", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "6", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "7", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "8", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "9", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "10", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "11", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "12", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },
  { id: "13", title: "Whisper Tutorial", message: "No messages yet", time: "12:23", messagesCount: 5 },

  // Add more items here
];

const renderItem: ListRenderItem<Chat> = ({ item }) => (
  <Link href={`/chat/${item.id}`} asChild>
    <TouchableOpacity>
      <View style={styles.chat}>
        <Image source={icon} width={44} height={44} style={{ width: 44, height: 44, borderRadius: 12 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1 }}>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <StyledText font="14">{item.title}</StyledText>
              <MaterialIcons name="notifications-off" size={16} color={Colors.dark.secondaryLightGrey} />
            </View>
            <StyledText
              font="light"
              darkColor={Colors.dark.secondaryLightGrey}
              lightColor={Colors.light.secondaryLightGrey}
            >
              {item.message}
            </StyledText>
          </View>

          <View style={{ alignItems: "flex-end", gap: 8 }}>
            <StyledText font="12">{item.time}</StyledText>
            <View style={{ backgroundColor: Colors.dark.mainPurple, padding: 4, borderRadius: 12 }}>
              <StyledText font="light">{item.messagesCount}</StyledText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  </Link>
);

const Chats = () => {
  return (
    <View style={styles.container}>
      <FlatList<Chat> renderItem={renderItem} data={data} keyExtractor={(item) => item.id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chat: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  pressed: {
    backgroundColor: "red",
  },
});

export default Chats;
