import { View, StyleSheet, Text } from "react-native";
import ChatList from "../components/ChatList";
import MessageInput from "../components/MessageInput";
import useChat from "../hooks/useChat";

const ChatScreen = () => {
  const { messages, sendMessage, currentUser } = useChat();

  return (
    <View style={styles.container}>
      {currentUser ? (
        <ChatList messages={messages} currentUserId={currentUser.id} />
      ) : (
        <Text>Loading or not authenticated...</Text>
      )}
      <MessageInput onSend={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatScreen;
