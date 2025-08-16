import axios, { AxiosError, AxiosRequestConfig } from "axios";
import API from "@/constants/API";
import { TokenManager } from "./TokenManager";

const api = axios.create({
    baseURL: API.apiURL,
});


let isRefreshing = false;

let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

api.interceptors.request.use(
    async (config) => {
        if (config.skipAuth) return config;
        const accessToken = await TokenManager.getAccessToken();
        if (!accessToken) {
            throw new AxiosError(
                'No access token – request aborted by interceptor',
                'ERR_CANCELED',
                config
            );
        }
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// TODO: refactor this interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log("[AXIOS] Expired token interceptor triggered");
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
                const newToken = await TokenManager.refreshAccessToken();

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
