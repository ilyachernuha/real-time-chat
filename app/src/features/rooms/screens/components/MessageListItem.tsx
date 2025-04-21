import Icons from "@/components/Icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import Message from "@/model/Message";
import User from "@/model/User";
import { Relation } from "@nozbe/watermelondb";
import { withObservables } from "@nozbe/watermelondb/react";
import React from "react";
import { View, Text, Image } from "react-native";

type Props = {
  message: Message;
  user: User;
  isOwn: boolean;
};

export const MessageListItem = ({ message: { text, timestamp, syncStatus }, user, isOwn }: Props) => {
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
          width={44}
          height={44}
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
        <Text style={{ color: "red" }}>{syncStatus}</Text>

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
