import { ROOMS_ROUTES } from "@/features/rooms/constants/roomsApiRoutes";
import {
  CreateRoom,
  CreateRoomResponse,
  MessagesResponse,
  MyRoomResponse,
  SendMessagePayload,
  SendMessageResponse,
  SyncRoomMessagesRequest,
  SyncRoomMessagesResponse,
  UserResponse,
} from "@/features/rooms/types/RoomsRequests";
import api from "@/lib/api";

export const roomsApi = {
  createRoom: async (room: CreateRoom) => {
    return (await api.post<CreateRoomResponse>(ROOMS_ROUTES.CREATE_ROOM, { ...room })).data;
  },
  myRooms: async () => {
    return (await api.get<MyRoomResponse>(ROOMS_ROUTES.ROOMS)).data;
  },
  messages: async (room_id: string) => {
    return (await api.get<MessagesResponse>(ROOMS_ROUTES.MESSAGES, { params: { room_id } })).data;
  },
  syncRoomMessages: async (params: SyncRoomMessagesRequest) => {
    return (await api.get<SyncRoomMessagesResponse>(ROOMS_ROUTES.SYNC_ROOM_MESSAGES, { params })).data;
  },
  user: async (userId: string) => {
    return (await api.get<UserResponse>(`${ROOMS_ROUTES.USER}/${userId}`)).data;
  },
  sendMessage: async (message: FormData) => {
    const response = await api.post<SendMessageResponse>(ROOMS_ROUTES.SEND_MESSAGE, message, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);
    return response.data;
  },
};
