import ChatHeader from "@/components/ChatHeader";
import { SafeAreaView, Text, View } from "@/components/Themed";
import { Stack, useLocalSearchParams } from "expo-router";

const Chat = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          header: (props) => {
            console.log(props);
            return <ChatHeader id={id} />;
          },
        }}
      />
      <Text>Chat id is {id}</Text>
    </View>
  );
};

export default Chat;
