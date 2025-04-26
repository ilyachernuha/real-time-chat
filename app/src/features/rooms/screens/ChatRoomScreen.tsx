import { ChatHeader } from "@/features/rooms/screens/components/ChatHeader";
import { MessageInput } from "@/features/rooms/screens/components/MessageInput";
import { EnchancedMessagesList } from "@/features/rooms/screens/components/MessagesList";
import { sendMessage } from "@/features/rooms/services/sendMessage";
import { roomsCollection } from "@/index.native";
import Room from "@/model/Room";
import { withObservables } from "@nozbe/watermelondb/react";
import { Observable } from "@nozbe/watermelondb/utils/rx";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

type Props = {
  room: Room;
};

export const ChatRoomScreenBase = ({ room }: Props) => {
  const [text, setText] = useState("");

  const handleChangeText = (input: string) => {
    setText(input);
  };

  const handleSendMessage = () => {
    sendMessage(text, room);
    setText("");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ChatHeader title={room?.title} />,
        }}
      />
      <KeyboardAvoidingView behavior="translate-with-padding" style={{ flex: 1 }}>
        <EnchancedMessagesList room={room} />
        <MessageInput value={text} handleChangeText={handleChangeText} sendMessage={handleSendMessage} />
      </KeyboardAvoidingView>
    </>
  );
};

type OuterProps = {
  roomId: string;
};

type InjectedProps = {
  room: Observable<Room>;
};

const enhance = withObservables<OuterProps, InjectedProps>(["roomId"], ({ roomId }) => ({
  room: roomsCollection.findAndObserve(roomId),
}));

const EnhancedChatRoomScreen = enhance(ChatRoomScreenBase);

export const ChatRoomScreen = () => {
  const { id } = useLocalSearchParams();
  return <EnhancedChatRoomScreen roomId={id} />;
};
