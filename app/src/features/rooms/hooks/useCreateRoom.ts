import { roomsApi } from "@/features/rooms/services/roomsApi";
import { CreateRoomFormData } from "@/features/rooms/validators/createRoomSchema";
import { db, roomsCollection } from "@/index.native";
import { useDropdownStore } from "@/stores/dropdownStore";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

export const useCreateRoom = () => {
  const router = useRouter();

  useEffect(() => {
    return () => {
      useDropdownStore.getState().closeDropdown();
    };
  });

  const createRoom = async (values: CreateRoomFormData) => {
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
        console.error(error.response.data);
        return error.response.data;
      } else {
        console.error(error);
        Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
      }
    }
  };

  return { createRoom };
};
