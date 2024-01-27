import React from "react";
import { FlatList, StyleSheet } from "react-native";
import ChatBubble from "./ChatBubble";
import { ChatMessageReceive } from "../types";

interface ChatListProps {
  messages: ChatMessageReceive[];
  currentUserId: string;
}

const ChatList: React.FC<ChatListProps> = ({ messages, currentUserId }) => {
  const renderItem = ({ item }: { item: ChatMessageReceive }) => (
    <ChatBubble message={item} isOwnMessage={item.user.id === currentUserId} />
  );

  return (
    <FlatList
      data={messages}
      renderItem={renderItem}
      keyExtractor={(item) => item.text} //TODO: replace to messageId
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});

export default ChatList;
