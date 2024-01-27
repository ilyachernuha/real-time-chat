import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ChatMessage } from "../types";

interface ChatBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwnMessage }) => {
  const bubbleStyles = [
    styles.bubble,
    isOwnMessage ? styles.ownBubble : styles.otherBubble,
  ];
  const textStyles = [
    styles.text,
    isOwnMessage ? styles.ownText : styles.otherText,
  ];

  return (
    <View style={bubbleStyles}>
      <Text style={textStyles}>{message.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: "80%",
  },
  ownBubble: {
    backgroundColor: "#007bff",
    alignSelf: "flex-end",
  },
  otherBubble: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 16,
  },
  ownText: {
    color: "#fff",
  },
  otherText: {
    color: "#000",
  },
});

export default ChatBubble;
