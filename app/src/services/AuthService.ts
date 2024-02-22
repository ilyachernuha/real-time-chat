import "@/polyfills";
import axios from "axios";
import API from "@/constants/API";
import * as types from "./types";

const api = axios.create({
  baseURL: API.apiURL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Server responded with an error:", error.response.status, error.response.data);
        throw error;
      } else if (error.request) {
        console.error("No response received for the request");
        throw new Error("The request was made but no response was received");
      } else {
        console.error("Error setting up the request:", error.message);
        throw new Error("Something happened in setting up the request that triggered an Error");
      }
    } else {
      console.error("An unexpected error occurred:", error);
      throw new Error("An unexpected error occurred");
    }
  }
);

export default {
  login: async (credentials: types.LoginRequest) => {
    const response = await api.post<types.LoginResponse>("/login", {}, { auth: credentials });
    return response.data;
  },

  register: async (credentials: types.RegisterRequest) => {
    const response = await api.post<types.RegisterResponse>("/create_account", credentials);
    return response.data;
  },

  confirm: async (confirmation: types.ConfirmRequest) => {
    const response = await api.post<types.ConfirmResponse>("finish_registration", confirmation);
    return response.data;
  },

  guestLogin: async (guest: types.GuestLoginRequest) => {
    const response = await api.post<types.GuestLoginResponse>("/guest_login", guest);
    return response.data;
  },

  forgotPassword: async (guest: types.ForgotPasswordRequest) => {
    const response = await api.post<types.ForgotPasswordResponse>("/reset_password", guest);
    return response.data;
  },
  resetPassword: async (credentials: types.ResetPasswordRequest) => {
    const response = await api.put<types.ResetPasswordResponse>("/finish_reset_password", credentials);
    return response.data;
  },
};
