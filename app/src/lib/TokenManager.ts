import { useAuthStore } from "@/features/auth/services/authStore";
import { AUTH_ROUTES } from "@/features/auth/constants/authRoutes";
import { isAxiosError } from "axios";
import api from "./api";

const ACCESS_TOKEN_TTL_MS = 60_000;
const SKEW = ACCESS_TOKEN_TTL_MS * 0.025;
const ACCEPTABLE = ACCESS_TOKEN_TTL_MS * 0.2;

type RefreshAccessTokenCredential = {
    refresh_token: string;
    session_id: string;
};

type RefreshTokenResponse = {
    access_token: string;
    new_refresh_token: string;
};

const fetchAccessToken = async (credentials: RefreshAccessTokenCredential) => {
    return (await api.post<RefreshTokenResponse>(AUTH_ROUTES.REFRESH_TOKEN, credentials, { skipAuth: true })).data;
};


const getAccessToken = async () => {
    if (tokenIsNotExpired()) return useAuthStore.getState().accessToken;
    console.log("[AUTH] Token is expired. Trying to refresh token...");
    return await refreshAccessToken();
}

const tokenIsNotExpired = () => tokenTimeLeft() > 0;

const tokenTimeLeft = () => {
    const exp = useAuthStore.getState().accessTokenPayload?.exp;
    if (!exp) return 0;
    return exp * 1000 - Date.now() - SKEW;
}


let tokenTimeoutId: ReturnType<typeof setTimeout> | null = null;

const scheduleTokenRefresh = () => {
    console.log("[AUTH] Schedule next token refresh");
    // cancelTokenRefresh();
    tokenTimeoutId = setTimeout(refreshAccessToken, Math.max(tokenTimeLeft() - ACCEPTABLE, 0));
}

const cancelTokenRefresh = () => {
    if (tokenTimeoutId == null) return;
    console.log("[AUTH] Cancel next token refresh");
    clearTimeout(tokenTimeoutId);
}


let tokenPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
    if (tokenPromise) return tokenPromise;
    // cancelTokenRefresh();
    tokenPromise = createRefreshTokenRequest();
    return tokenPromise;
}

const createRefreshTokenRequest = async (): Promise<string | null> => {
    const { session, refreshToken } = useAuthStore.getState();

    if (!refreshToken || !session) return null;

    try {
        const { access_token, new_refresh_token } = await fetchAccessToken({
            refresh_token: refreshToken,
            session_id: session,
        });
        useAuthStore.getState().setAuthTokens({ accessToken: access_token, refreshToken: new_refresh_token });
        scheduleTokenRefresh();
        console.log("[AUTH] Successfull token refresh");
        return access_token;
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401 && error.response.data?.detail === 'Invalid refresh token') {
            useAuthStore.getState().logout();
            console.error("[AUTH] Invalid refresh token - logging out", error.response.data.detail);
        } else {
            console.error("[AUTH] Unknown error during token refresh", error);
        }
        return null;
    } finally {
        tokenPromise = null;
    }
}


export const TokenManager = {
    getAccessToken,
    tokenIsNotExpired,
    refreshAccessToken,
    scheduleTokenRefresh,
    cancelTokenRefresh,
    tokenTimeLeft
}
