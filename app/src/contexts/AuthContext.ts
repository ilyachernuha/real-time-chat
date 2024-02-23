import { LoginRequest, RegisterRequest, ResetPasswordRequest } from "@/services/types";
import { createContext } from "react";

export const AuthContext = createContext<{
  signIn: (credentials: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (credentials: RegisterRequest) => Promise<void>;
  confirm: (confirmationCode: string) => Promise<void>;
  guestLogin: (username: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (credentials: ResetPasswordRequest) => Promise<void>;
  isLoading: boolean;
  token: string | null;
}>({
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  confirm: async () => {},
  guestLogin: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  isLoading: false,
  token: null,
});
