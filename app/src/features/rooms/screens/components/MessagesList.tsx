import { useAuthStore } from "@/features/auth/services/authStore";
import { EnhancedMessageListItem } from "@/features/rooms/screens/components/MessageListItem";
import Message from "@/model/Message";
import { withObservables } from "@nozbe/watermelondb/react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";

type Props = {
  messages: Message[];
};

const keyExtractor = (m: Message) => m.id;

const renderItem = ({ item }: ListRenderItemInfo<Message>) => {
  const isOwn = item.user.id === useAuthStore.getState().user?.id;
  return <EnhancedMessageListItem message={item} isOwn={isOwn} />;
};

const mvp = { minIndexForVisible: 0, autoscrollToTopThreshold: 48 };

export const MessagesList = ({ messages }: Props) => {
  return (
    <FlatList
      data={messages}
      inverted
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews={false}
      windowSize={10}
      maxToRenderPerBatch={8}
      updateCellsBatchingPeriod={50}
      initialNumToRender={14}
      scrollEventThrottle={16}
      maintainVisibleContentPosition={mvp}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      contentContainerStyle={styles.content}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 16,
    paddingTop: 80,
  },
});

const enhance = withObservables(["room"], ({ room }) => ({
  messages: room.sortedMessages,
}));

export const EnchancedMessagesList = enhance(MessagesList);
