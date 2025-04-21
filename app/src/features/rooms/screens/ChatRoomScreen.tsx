import Icons from "@/components/Icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { ChatHeader } from "@/features/rooms/screens/components/ChatHeader";
import { EnchancedMessagesList } from "@/features/rooms/screens/components/MessagesList";
import { sendMessage } from "@/features/rooms/services/sendMessage";
import { roomsCollection } from "@/index.native";
import Room from "@/model/Room";
import { withObservables } from "@nozbe/watermelondb/react";
import { Observable } from "@nozbe/watermelondb/utils/rx";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Pressable, TextInput } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

type Props = {
  room: Room;
};

export const ChatRoomScreenBase = ({ room }: Props) => {
  const [text, setText] = useState<string>("");

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

        <View
          style={{
            flexDirection: "row",
            backgroundColor: Colors.dark.mainDarkGrey,
            borderRadius: 12,
            position: "absolute",
            bottom: 0,
            margin: 8,
          }}
        >
          <Pressable style={{ padding: 10 }}>
            <Icons name="attach" color={Colors.dark.secondaryLightGrey} size={24} />
          </Pressable>

          <TextInput
            style={[{ padding: 8, flex: 1, color: Colors.dark.text }, Fonts[14]]}
            cursorColor={Colors.dark.text}
            onChangeText={(text) => {
              setText(text);
            }}
            value={text}
            multiline
          />
          <Pressable
            style={{ padding: 10 }}
            onPress={() => {
              sendMessage(text, room);
              setText("");
            }}
          >
            <Icons name="send" color={Colors.dark.secondaryLightGrey} size={24} />
          </Pressable>
        </View>
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
