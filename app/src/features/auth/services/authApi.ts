import api from "@/lib/api";
import { AUTH_ROUTES } from "@/features/auth/constants/authRoutes";
import deviceInfo from "@/utils/deviceInfo";
import { LoginResponse, PasswordResponse, RegisterResponse } from "@/features/auth/types/AuthResponse";
import {
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
  VerifyCodeCredentials,
} from "@/features/auth/types/AuthCredentials";

export const authApi = {
  login: async (auth: LoginCredentials) => {
    return (await api.post<LoginResponse>(AUTH_ROUTES.LOGIN, { device_info: deviceInfo }, { auth })).data;
  },

  guestLogin: async (name: string) => {
    return (await api.post<LoginResponse>(AUTH_ROUTES.GUEST_LOGIN, { name, device_info: deviceInfo })).data;
  },

  register: async (credentials: RegisterCredentials) => {
    return (
      await api.post<RegisterResponse>(AUTH_ROUTES.REGISTER, {
        ...credentials,
        device_info: deviceInfo,
      })
    ).data;
  },

  verifyCode: async (confirmation: VerifyCodeCredentials) => {
    return (await api.post<LoginResponse>(AUTH_ROUTES.VERIFY_CODE, confirmation)).data;
  },

  forgotPassword: async (email: string) => {
    return (await api.post<PasswordResponse>(AUTH_ROUTES.FORGOT_PASSWORD, { email })).data;
  },

  resetPassword: async (credentials: ResetPasswordCredentials) => {
    return (await api.post<PasswordResponse>(AUTH_ROUTES.RESET_PASSWORD, credentials)).data;
  },
};
