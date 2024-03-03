import { AxiosBasicCredentials } from "axios";
import api from "./api";
import {
  LoginResponse,
  RegisterConfirmation,
  RegisterCredentials,
  RegisterResponse,
  ResetPasswordRequest,
} from "./types";

export default {
  register: async (credentials: RegisterCredentials) => {
    const { data } = await api.post<RegisterResponse>("/create_account", credentials);
    return data;
  },
  confirmRegistration: async (confirmation: RegisterConfirmation) => {
    const { data } = await api.post<LoginResponse>("/finish_registration", confirmation);
    return data;
  },
  login: async (auth: AxiosBasicCredentials) => {
    const { data } = await api.post<LoginResponse>("/login", {}, { auth });
    return data;
  },

  guestLogin: async (name: string) => {
    const { data } = await api.post<LoginResponse>("/guest_login", { name });
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post<{ status: string }>("/reset_password", { email });
    return data;
  },

  resetPassword: async (request: ResetPasswordRequest) => {
    const { data } = await api.put<{ status: string }>("/finish_reset_password", request);
    return data;
  },
};
