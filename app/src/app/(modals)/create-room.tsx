import { DropdownBackdrop } from "@/components/common/dropdown/DropdownBackdrop";
import { CreateRoomForm, CreateRoomFormData } from "@/components/rooms/CreateRoomForm";
import CreateRoomHeader from "@/components/headers/CreateRoomHeader";
import Icons from "@/components/Icons";
import RoomsService from "@/services/RoomsService";
import { isAxiosError } from "axios";
import { useRouter, Stack } from "expo-router";
import { Alert, View, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Colors from "@/constants/Colors";

export default function CreateRoomModal() {
  const router = useRouter();

  const handleSubmit = async (values: CreateRoomFormData) => {
    console.log(values);
    try {
      const res = await RoomsService.createRoom(values);
      router.back();
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        Alert.alert("Validation Error", error.response.data.detail);
      } else {
        Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
      }
    }
  };


  return (
    <>
      <Stack.Screen options={{ presentation: "modal", headerShown: true, header: () => <CreateRoomHeader /> }} />
      <KeyboardAwareScrollView
        bottomOffset={50}
        contentContainerStyle={styles.content}
        style={styles.container}
        keyboardShouldPersistTaps={"handled"}
      >
        <View style={styles.imagePicker}>
          <Icons name="image" size={40} color={Colors.dark.text} />
        </View>
        <DropdownBackdrop />
        <CreateRoomForm onSubmit={handleSubmit} />
      </KeyboardAwareScrollView>
    </>
  );
}

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  content: {
    paddingTop: 50,
    gap: 50,
  },
  imagePicker: {
    width: 100,
    height: 100,
    backgroundColor: Colors.dark.mainDarkGrey,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
