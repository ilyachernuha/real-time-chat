import { withObservables } from "@nozbe/watermelondb/react";
import { Q } from "@nozbe/watermelondb";
import { messagesCollection } from "@/index.native";
import { MessagesList } from "@/features/rooms/screens/components/MessagesList";

type Props = {
  roomId: string;
};

const enhance = withObservables(["roomId"], ({ roomId }: Props) => {
  return {
    messages: messagesCollection.query(Q.where("room_remote_id", roomId)),
  };
});

const EnhancedMessagesList = enhance(MessagesList);

export default EnhancedMessagesList;
