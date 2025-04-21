import { EnchancedRoomsList } from "@/features/rooms/screens/components/RoomsList";
import { syncRooms } from "@/features/rooms/services/syncRooms";
import { useEffect } from "react";

export const RoomsScreen = () => {
  useEffect(() => {
    syncRooms();
  }, []);

  return <EnchancedRoomsList />;
};
