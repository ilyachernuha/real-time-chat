import { useEffect } from "react";
import chatService from "../services/chatService";
import { ChatMessage, ChatMessageReceive } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { receiveMessage } from "../store/chatSlice";
import { RootState } from "../store/store";

const useChat = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.chat.messages);
  const currentUser = useSelector((state: RootState) => state.chat.currentUser);

  useEffect(() => {
    if (currentUser) {
      chatService.connect(currentUser.token);
    }

    const unsubscribe = chatService.subscribeToMessages(
      (newMessage: ChatMessageReceive) => {
        dispatch(receiveMessage(newMessage));
      }
    );

    return () => {
      unsubscribe();
      chatService.disconnect();
    };
  }, [currentUser, dispatch]);

  const sendMessage = (text: string) => {
    const message: ChatMessage = {
      text,
      room: "test",
    };

    chatService.sendMessage(message);
  };

  return { messages, sendMessage, currentUser };
};

export default useChat;
