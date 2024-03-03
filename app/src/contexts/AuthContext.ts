import { RegisterCredentials, ResetPasswordRequest } from "@/services/types";
import { AxiosBasicCredentials } from "axios";
import { createContext } from "react";

export interface AuthContext {
  signIn: (credentials: AxiosBasicCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  confirm: (confirmationCode: string) => Promise<void>;
  guestLogin: (name: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  refreshToken: string | null;
  isLoading: boolean;
  sessionId: string | null;
  userId: string | null;
  username: string | null;
  name: string | null;
  changeName: (name: string) => Promise<void>;
}

const AuthContextInit = {
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  confirm: async () => {},
  guestLogin: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  refreshToken: null,
  isLoading: true,
  sessionId: null,
  userId: null,
  username: null,
  name: null,
  changeName: async () => {},
};

export const AuthContext = createContext<AuthContext>(AuthContextInit);
