import api from "./api";
import { ChangeNameResponse } from "./types";

const baseURL = "/users";

export default {
  changeName: async (new_name: string) => {
    const { data } = await api.put<ChangeNameResponse>(`${baseURL}/change_name`, { new_name });
    return data;
  },
};
