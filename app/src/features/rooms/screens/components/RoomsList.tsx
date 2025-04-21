import { EnhancedRoomListItem } from "@/features/rooms/screens/components/RoomListItem";
import { roomsCollection } from "@/index.native";
import Room from "@/model/Room";
import { Q } from "@nozbe/watermelondb";
import { withObservables } from "@nozbe/watermelondb/react";
import { FlashList } from "@shopify/flash-list";
import { Text } from "react-native";

type Props = {
  rooms: Room[];
};

export const RoomsList = ({ rooms }: Props) => (
  <FlashList
    data={rooms}
    renderItem={({ item }) => <EnhancedRoomListItem room={item} />}
    estimatedItemSize={70}
    keyExtractor={(room) => room.id}
    ListEmptyComponent={<Text>No rooms available</Text>}
  />
);

const enhance = withObservables([], () => ({
  rooms: roomsCollection.query(Q.sortBy("last_message_at", Q.desc)).observeWithColumns(["last_message_at"]),
}));

export const EnchancedRoomsList = enhance(RoomsList);
