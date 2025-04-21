import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import API from "@/constants/API";
import { useAuthStore } from "@/features/auth/services/authStore";
import { AUTH_ROUTES } from "@/features/auth/constants/authRoutes";

// Create Axios instance
const api = axios.create({
  baseURL: API.apiURL,
});

type RefreshAccessTokenCredential = {
  refresh_token: string;
  session_id: string;
};

type RefreshTokenResponse = {
  access_token: string;
  new_refresh_token: string;
};

const fetchAccessToken = async (credentials: RefreshAccessTokenCredential) => {
  return (await api.post<RefreshTokenResponse>(AUTH_ROUTES.REFRESH_TOKEN, credentials)).data;
};

// State to handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Process the queued requests once token is refreshed or failed
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Refresh the access token
export const refreshAccessToken = async (): Promise<string | null> => {
  const { session, refreshToken, setAuthTokens, logout } = useAuthStore.getState();

  if (!refreshToken || !session) return null;

  try {
    const { access_token, new_refresh_token } = await fetchAccessToken({
      refresh_token: refreshToken,
      session_id: session,
    });

    setAuthTokens({ accessToken: access_token, refreshToken: new_refresh_token });

    return access_token;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Token refresh failed - logging out", error.response?.data);
    } else {
      console.error("❌ Unknown error during token refresh", error);
    }

    logout();
    return null;
  }
};

// Request interceptor: attach token
api.interceptors.request.use(
  async (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: refresh token if needed
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && typeof token === "string") {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              };
              return api(originalRequest);
            }
            return Promise.reject(error);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return api(originalRequest);
        } else {
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
