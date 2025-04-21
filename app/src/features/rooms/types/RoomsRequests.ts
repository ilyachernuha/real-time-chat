import { RoomLanguageCode } from "@/features/rooms/constants/RoomLanguages";
import { RoomTheme } from "@/features/rooms/constants/RoomThemes";

export type CreateRoom = {
  title: string;
  description?: string;
  theme: RoomTheme;
  languages: RoomLanguageCode[];
  tags: string[];
  make_public: boolean;
  // users_to_add: [
  //   {
  //     user_id: string;
  //     make_admin: boolean;
  //   }
  // ];
};

export type CreateRoomResponse = {
  status: string;
  room_id: string;
};

export type Room = {
  room_id: string;
  title: string;
  room_picture_id: string;
};

export type MyRoomResponse = {
  rooms: Room[];
};

export type Message = {
  message_id: string;
  user_id: string;
  text: string;
  created_at: number;
  updated_at: number;
  attachments: [
    {
      attachment_id: string;
      type: string;
      presigned_url: string;
      original_name: string;
    }
  ];
};

export type MessagesResponse = {
  messages: Message[];
};

export type SyncRoomMessagesRequest = {
  room_id: string;
  after: number;
};

export type SyncRoomMessagesResponse = {
  new_messages: Message[];
  updated_messages: Message[];
};

export type UserResponse = {
  name: string;
  guest: boolean;
  username: string;
  profile_picture_id: string;
};
