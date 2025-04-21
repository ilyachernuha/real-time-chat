import { useAuthStore } from "@/features/auth/services/authStore";
import { EnhancedMessageListItem } from "@/features/rooms/screens/components/MessageListItem";
import Message from "@/model/Message";
import Room from "@/model/Room";
import { Query } from "@nozbe/watermelondb";
import { withObservables } from "@nozbe/watermelondb/react";
import { FlatList, Text, View } from "react-native";

type Props = {
  messages: Message[];
};

export const MessagesList = ({ messages }: Props) => {
  const userId = useAuthStore((state) => state.user?.id);

  return (
    <FlatList
      // style={{
      //   backgroundColor: "green",
      // }}
      contentContainerStyle={{
        paddingTop: 80,
        paddingBottom: 16,
        paddingHorizontal: 8,
        // justifyContent: "flex-end",
        // flexGrow: 1,
        // backgroundColor: "red",
      }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      data={messages}
      renderItem={({ item }) => <EnhancedMessageListItem message={item} isOwn={item.user.id === userId} />}
      keyExtractor={(message) => message.id}
      ListEmptyComponent={<Text style={{ color: "red" }}>No messages available</Text>}
      // initialNumToRender={15}
      // maxToRenderPerBatch={10}
      // windowSize={5}
      // removeClippedSubviews={true}
      inverted
    />
  );
};

type OuterProps = {
  room: Room;
};

type InjectedProps = {
  messages: Query<Message>;
};

const enhance = withObservables<OuterProps, InjectedProps>(["room"], ({ room }) => ({
  messages: room.sortedMessages,
}));

export const EnchancedMessagesList = enhance(MessagesList);
