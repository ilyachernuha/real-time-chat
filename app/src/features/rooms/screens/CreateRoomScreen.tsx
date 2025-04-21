import { DropdownBackdrop } from "@/components/dropdown/DropdownBackdrop";
import { CreateRoomForm, CreateRoomFormData } from "@/features/rooms/screens/components/CreateRoomForm";
import CreateRoomHeader from "@/features/rooms/screens/components/CreateRoomHeader";
import Icons from "@/components/Icons";
import { isAxiosError } from "axios";
import { useRouter, Stack } from "expo-router";
import { Alert, View, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Colors from "@/constants/Colors";
import { roomsApi } from "@/features/rooms/services/roomsApi";
import { db, roomsCollection } from "@/index.native";
import { useEffect } from "react";
import { useDropdownStore } from "@/stores/dropdownStore";

const CreateRoomScreen = () => {
  const router = useRouter();

  const handleSubmit = async (values: CreateRoomFormData) => {
    try {
      const { room_id } = await roomsApi.createRoom(values);

      await db.write(async () => {
        await roomsCollection.create((room) => {
          room._raw.id = room_id;
          room.title = values.title;
          room._raw._status = "synced";
        });
      });

      router.back();
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        Alert.alert("Validation Error", error.response.data.detail);
      } else {
        console.error(error);
        // Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
      }
    }
  };

  useEffect(() => {
    return () => {
      useDropdownStore.getState().closeDropdown();
    };
  });

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
};

const styles = StyleSheet.create({
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

export default CreateRoomScreen;
