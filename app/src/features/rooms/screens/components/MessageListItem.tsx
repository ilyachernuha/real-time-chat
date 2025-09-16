import Message from "@/model/Message";
import User from "@/model/User";
import { withObservables } from "@nozbe/watermelondb/react";
import { View, Text, StyleSheet } from "react-native";
import Attachment from "@/model/Attachment";
import { memo } from "react";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { Image } from "expo-image";
import { AttachmentImage } from "./AttachmentImage";
import Icons from "@/components/Icons";

function formatDate(date: Date, locale = undefined) {
  const options = {
    weekday: "short", // Tue / Di / mar / etc
    day: "2-digit", // 06
    month: "2-digit", // 02
    hour: "2-digit", // 18
    minute: "2-digit", // 28
    hour12: false, // 24h clock
  } as Intl.DateTimeFormatOptions;

  const parts = new Intl.DateTimeFormat(locale, options).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  return `${map.weekday} ${map.day}.${map.month} ${map.hour}:${map.minute}`;
}

type Props = {
  message: Message;
  user: User;
  attachments: Attachment[];
  isOwn: boolean;
};

export const MessageListItem = memo(({ message: { text, timestamp }, isOwn, user, attachments }: Props) => {
  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      {!isOwn && <Image source={require("../../../../../assets/images/icon.png")} style={styles.profilePicture} />}
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
          { paddingTop: isOwn && attachments.length < 1 ? 8 : 0 },
        ]}
      >
        {!isOwn && <UserName text={user.name} />}

        {attachments &&
          attachments.map((attachment) => <AttachmentImage key={attachment.id} attachment={attachment} />)}

        {text && <TextSelectable text={text} />}
        <View style={styles.footer}>
          <MessageDate date={timestamp} isOwn={isOwn} />
          {isOwn && <Icons name="message-read" size={16} color={Colors.dark.text} />}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    padding: 8,
    width: "100%",
    flexDirection: "row",
    gap: 4,
  },
  rowOwn: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    overflow: "hidden",
  },
  bubbleOwn: {
    backgroundColor: Colors.dark.mainBlue,
  },
  bubbleOther: {
    backgroundColor: Colors.dark.mainDarkGrey,
  },
  profilePicture: {
    aspectRatio: 1 / 1,
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 12,
    gap: 12,
  },
});

const textStyle = StyleSheet.create({ t: { color: Colors.dark.text, ...Fonts.light_12, paddingHorizontal: 12 } });
const TextSelectable = memo(({ text }: { text: string }) => {
  return (
    <Text style={textStyle.t} selectable allowFontScaling>
      {text}
    </Text>
  );
});

const userNameStyle = StyleSheet.create({
  t: { color: Colors.dark.secondaryLightGrey, ...Fonts["12"], paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
});
const UserName = memo(({ text }: { text: string }) => {
  return (
    <Text style={userNameStyle.t} allowFontScaling>
      {text}
    </Text>
  );
});

const messageDateStyle = StyleSheet.create({
  t: { ...Fonts.light },
  own: { color: Colors.dark.secondaryLightBlue },
  other: { color: Colors.dark.secondaryLightGrey },
});
const MessageDate = memo(({ date, isOwn }: { date: Date; isOwn: boolean }) => {
  return (
    <Text style={[messageDateStyle.t, isOwn ? messageDateStyle.own : messageDateStyle.other]} allowFontScaling>
      {formatDate(date)}
    </Text>
  );
});

const enhance = withObservables(["message"], ({ message }) => ({
  message,
  user: message.user,
  attachments: message.attachments,
}));

export const EnhancedMessageListItem = enhance(MessageListItem);
