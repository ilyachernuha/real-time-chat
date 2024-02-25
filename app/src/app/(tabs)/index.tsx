import { View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { FlatList, Image, ListRenderItem, Pressable, StyleSheet, Touchable, TouchableOpacity } from "react-native";
import icon from "../../../assets/images/icon.png";
import { Light, Regular12, Regular14 } from "@/components/StyledText";
import { Link } from "expo-router";

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
              <Regular14>{item.title}</Regular14>
              <MaterialIcons name="notifications-off" size={16} color={Colors.dark.secondaryLightGrey} />
            </View>
            <Light darkColor={Colors.dark.secondaryLightGrey} lightColor={Colors.light.secondaryLightGrey}>
              {item.message}
            </Light>
          </View>

          <View style={{ alignItems: "flex-end", gap: 8 }}>
            <Regular12>{item.time}</Regular12>
            <View style={{ backgroundColor: Colors.dark.mainPurple, padding: 4, borderRadius: 12 }}>
              <Light>{item.messagesCount}</Light>
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
