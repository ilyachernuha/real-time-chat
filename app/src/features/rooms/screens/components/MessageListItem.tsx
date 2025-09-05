import Icons from "@/components/Icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import Message from "@/model/Message";
import User from "@/model/User";
import { Relation } from "@nozbe/watermelondb";
import { withObservables } from "@nozbe/watermelondb/react";
import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";

type Props = {
  message: Message;
  user: User;
  isOwn: boolean;
};

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const MessageListItem = ({ message: { text, timestamp }, user, isOwn }: Props) => {
  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "short", // Tue
    day: "2-digit", // 06
    month: "2-digit", // 02
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(timestamp)
    .replaceAll(", ", " ");

  return (
    <View style={{ flexDirection: "row", gap: 4, alignSelf: isOwn ? "flex-end" : "flex-start" }}>
      {!isOwn && (
        <Image
          source={require("../../../../../assets/images/icon.png")}
          style={{ width: 44, height: 44, borderRadius: 12 }}
        />
      )}

      <View
        style={{
          backgroundColor: isOwn ? Colors.dark.mainBlue : Colors.dark.mainDarkGrey,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 16,
          maxWidth: "75%",
          gap: 4,
        }}
      >
        {!isOwn && <Text style={[{ color: Colors.dark.secondaryLightGrey }, Fonts[12]]}>{user.name}</Text>}
        <Image
          style={{ flex: 1, width: "100%", backgroundColor: "#0553", aspectRatio: 1 / 1 }}
          source="https://picsum.photos/seed/696/3000/2000"
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
        />
        <Text style={[{ color: Colors.dark.text }, Fonts.light_12]}>{text}</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-end",
            paddingTop: 4,
          }}
        >
          <Text
            style={[
              { color: isOwn ? Colors.dark.secondaryLightBlue : Colors.dark.secondaryLightGrey, flexGrow: 1 },
              Fonts.light,
            ]}
          >
            {date}
          </Text>

          <Icons name="message-read" size={16} color={isOwn ? Colors.dark.text : "transparent"} />
        </View>
      </View>
    </View>
  );
};

type OuterProps = {
  message: Message;
};

type InjectedProps = {
  message: Message;
  user: Relation<User>;
};

const enhance = withObservables<OuterProps, InjectedProps>(["message"], ({ message }) => ({
  message,
  user: message.user,
}));

export const EnhancedMessageListItem = enhance(MessageListItem);

// export const MemoizedMessageListItem = React.memo(MessageListItem);
