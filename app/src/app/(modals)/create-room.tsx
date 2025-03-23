import CreateRoomHeader from "@/components/CreateRoomHeader";
import { Stack, useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function CreateRoomModal() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, header: () => <CreateRoomHeader /> }} />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Create a new room</Text>
        <Button title="Close" onPress={() => router.back()} />
      </View>
    </>
  );
}
