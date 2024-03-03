import api from "./api";
import { ChangeNameResponse } from "./types";

export default {
  changeName: async (new_name: string) => {
    const { data } = await api.put<ChangeNameResponse>("/change_name", { new_name });
    return data;
  },
};
