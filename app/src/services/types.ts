import { RoomLanguageCode } from "@/constants/RoomLanguages";
import { RoomTheme } from "@/constants/RoomThemes";

export type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  status: string;
  application_id: string;
};

export type RegisterConfirmation = {
  application_id: string;
  confirmation_code: string;
};

export type LoginResponse = {
  user_id: string;
  session_id: string;
  refresh_token: string;
  access_token: string;
};

export type RefreshTokenResponse = {
  access_token: string;
  new_refresh_token: string;
};

export type ResetPasswordRequest = {
  application_id: string;
  new_password: string;
};

export type ChangeNameResponse = {
  status: string;
  new_name: string;
};

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
