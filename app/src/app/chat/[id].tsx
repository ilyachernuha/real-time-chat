import ChatHeader from "@/components/ChatHeader";
import Icons from "@/components/Icons";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Stack, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView edges={["right", "bottom", "left"]}>
      <Stack.Screen
        options={{
          header: () => {
            return <ChatHeader id={id} />;
          },
        }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView>
          <Text>Chat id is {id}</Text>
          <Text>Chat id is {id}</Text>
          <Text>Chat id is {id}</Text>
          <Text>Chat id is {id}</Text>
          <Text>Chat id is {id}</Text>
        </ScrollView>
        <View style={{ paddingTop: 32, paddingHorizontal: 24, paddingBottom: 16 }}>
          <View style={{ backgroundColor: Colors.dark.mainDarkGrey, flexDirection: "row", borderRadius: 12 }}>
            <Icons
              name="attach"
              size={24}
              color={Colors.dark.secondaryLightGrey}
              style={{ padding: 10, transform: [{ rotate: "45deg" }] }}
            />
            <TextInput
              style={{ flex: 1, color: Colors.dark.text }}
              placeholder="Message"
              placeholderTextColor={Colors.dark.secondaryLightGrey}
            />
            <Icons name="mic" size={24} color={Colors.dark.secondaryLightGrey} style={{ padding: 10 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
