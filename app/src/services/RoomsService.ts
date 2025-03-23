import api from "./api";
import { CreateRoom, CreateRoomResponse, MyRoomResponse, RegisterResponse } from "./types";

const baseURL = "/rooms";

export default {
  createRoom: async (room: CreateRoom) => {
    return (await api.post<CreateRoomResponse>(`${baseURL}/create_room`, { ...room })).data;
  },
  myRooms: async () => {
    return (await api.get<MyRoomResponse>(`${baseURL}/my_rooms`)).data;
  },
};
