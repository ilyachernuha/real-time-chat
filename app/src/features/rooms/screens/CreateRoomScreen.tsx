import { DropdownBackdrop } from "@/components/dropdown/DropdownBackdrop";
import { CreateRoomForm } from "@/features/rooms/screens/components/CreateRoomForm";
import CreateRoomHeader from "@/features/rooms/screens/components/CreateRoomHeader";
import Icons from "@/components/Icons";
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Colors from "@/constants/Colors";
import { useCreateRoomForm } from "@/features/rooms/hooks/useCreateRoomForm";

const CreateRoomScreen = () => {
  const { control, submit, isSubmitting } = useCreateRoomForm();
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
        <CreateRoomForm control={control} submit={submit} isSubmitting={isSubmitting} />
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
