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
import * as ImagePicker from "expo-image-picker";
import { roomsApi } from "../services/roomsApi";
import { isAxiosError } from "axios";
import { Alert } from "react-native";

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need photo library access.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) return;

    const image = result.assets[0];

    const formData = new FormData();

    formData.append("room_id", room.id);
    formData.append("attachments", { uri: image.uri, type: image.mimeType, name: image.fileName } as any);

    try {
      await roomsApi.sendMessage(formData);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error?.response?.data);
      }
    }
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
        <MessageInput
          value={text}
          handleChangeText={handleChangeText}
          sendMessage={handleSendMessage}
          pickImage={pickImage}
        />
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
