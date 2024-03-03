import ChatHeader from "@/components/ChatHeader";
import { SafeAreaView, Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { TextInput } from "react-native";

const Chat = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          header: (props) => {
            return <ChatHeader id={id} />;
          },
        }}
      />
      <View style={{ flex: 1 }}>
        <Text>Chat id is {id}</Text>
      </View>
      <View style={{ paddingTop: 32, paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={{ backgroundColor: Colors.dark.mainDarkGrey, flexDirection: "row", borderRadius: 12 }}>
          <MaterialIcons
            name="attach-file"
            size={24}
            color={Colors.dark.secondaryLightGrey}
            style={{ padding: 10, transform: [{ rotate: "45deg" }] }}
          />
          <TextInput
            style={{ flex: 1, color: Colors.dark.text }}
            placeholder="Message"
            placeholderTextColor={Colors.dark.secondaryLightGrey}
          />
          <MaterialIcons name="mic-none" size={24} color={Colors.dark.secondaryLightGrey} style={{ padding: 10 }} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Chat;
