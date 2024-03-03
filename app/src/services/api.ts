import "@/polyfills";
import axios from "axios";
import API from "@/constants/API";
import * as SecureStore from "expo-secure-store";
import { RefreshTokenResponse } from "./types";

const refrehTokens = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    const {
      data: { access_token, new_refresh_token },
    } = await api.post<RefreshTokenResponse>("/token_refresh", {
      refresh_token: refreshToken,
    });
    await SecureStore.setItemAsync("accessToken", access_token);
    await SecureStore.setItemAsync("refreshToken", new_refresh_token);
    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
};

const api = axios.create({
  baseURL: API.apiURL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("Error retrieving JWT token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const access_token = await refrehTokens();
        if (access_token) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }
    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (axios.isAxiosError(error)) {
//       if (error.response) {
//         console.error("Server responded with an error:", error.response.status, error.response.data);
//         throw error;
//       } else if (error.request) {
//         console.error("No response received for the request");
//         throw new Error("The request was made but no response was received");
//       } else {
//         console.error("Error setting up the request:", error.message);
//         throw new Error("Something happened in setting up the request that triggered an Error");
//       }
//     } else {
//       console.error("An unexpected error occurred:", error);
//       throw new Error("An unexpected error occurred");
//     }
//   }
// );

export default api;
