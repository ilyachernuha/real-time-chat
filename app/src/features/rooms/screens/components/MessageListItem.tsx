import Icons from "@/components/Icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import Message from "@/model/Message";
import User from "@/model/User";
import { withObservables } from "@nozbe/watermelondb/react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import Attachment from "@/model/Attachment";
import { Relation } from "@nozbe/watermelondb";
import { AttachmentImage } from "./AttachmentImage";

type Props = {
  message: Message;
  user: User;
  attachments: Attachment[];
  isOwn: boolean;
};

export const MessageListItem = ({ message: { text, timestamp }, user, isOwn, attachments }: Props) => {
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
          borderRadius: 16,
          maxWidth: "75%",
          overflow: "hidden",
          gap: 4,
          paddingTop: isOwn && attachments.length < 1 ? 8 : 0,
        }}
      >
        {!isOwn && (
          <Text style={[{ paddingHorizontal: 12, paddingTop: 8, color: Colors.dark.secondaryLightGrey }, Fonts[12]]}>
            {user.name}
          </Text>
        )}

        {attachments.map((attachment) => {
          return <AttachmentImage key={attachment.id} attachment={attachment} />;
        })}

        {text && (
          <Text
            style={[
              {
                paddingHorizontal: 12,
                color: Colors.dark.text,
              },
              Fonts.light_12,
            ]}
          >
            {text}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingHorizontal: 12,
            paddingBottom: 8,
            gap: 8,
          }}
        >
          <Text
            style={[
              {
                color: isOwn ? Colors.dark.secondaryLightBlue : Colors.dark.secondaryLightGrey,
                flexGrow: 1,
              },
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
  attachments: message.attachments,
}));

export const EnhancedMessageListItem = enhance(MessageListItem);

// export const MemoizedMessageListItem = React.memo(MessageListItem);
