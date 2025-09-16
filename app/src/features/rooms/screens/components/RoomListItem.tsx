import StyledText from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { Link } from "expo-router";
import { Pressable, View, StyleSheet, Text } from "react-native";
import Icons from "@/components/Icons";
import Room from "@/model/Room";
import { withObservables } from "@nozbe/watermelondb/react";
import Message from "@/model/Message";
import { map, Observable } from "@nozbe/watermelondb/utils/rx";
import Fonts from "@/constants/Fonts";
import { Image } from "expo-image";
import API from "@/constants/API";

type Props = {
  room: Room;
  unreadMessages: number;
  lastMessage: Message | null;
};

export const RoomListItem = ({ room: { id, title, pictureId }, unreadMessages, lastMessage }: Props) => {
  const time = lastMessage?.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <Link href={`/chat/${id}`} asChild>
      <Pressable style={styles.chat}>
        <Image
          source={
            pictureId
              ? `${API.apiURL}/room-pictures/100p/${pictureId}.jpeg`
              : require("../../../../../assets/images/icon.png")
          }
          style={{ width: 44, height: 44, borderRadius: 12, aspectRatio: 1 / 1 }}
          placeholder={require("../../../../../assets/images/icon.png")}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <StyledText font="14">{title}</StyledText>

              <Icons name="notifications-off" size={16} color={Colors.dark.secondaryLightGrey} />
            </View>

            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[{ color: Colors.dark.secondaryLightGrey, flexShrink: 1 }, Fonts.light]}
            >
              {lastMessage ? lastMessage.text : "No messages yet"}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end", gap: 8, marginLeft: 8 }}>
            <StyledText font="12">{time}</StyledText>

            {unreadMessages > 0 && (
              <View style={{ backgroundColor: Colors.dark.mainPurple, padding: 4, borderRadius: 12 }}>
                <StyledText font="light">{unreadMessages}</StyledText>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  chat: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
});

type OuterProps = {
  room: Room;
};

type InjectedProps = {
  room: Room;
  unreadMessages: Observable<number>;
  lastMessage: Observable<Message>;
};

const enhance = withObservables<OuterProps, InjectedProps>(["room"], ({ room }) => ({
  room,
  unreadMessages: room.unreadMessages.observeCount(),
  lastMessage: room.lastMessage.observe().pipe(map((messages) => messages[0] || null)),
}));

export const EnhancedRoomListItem = enhance(RoomListItem);
