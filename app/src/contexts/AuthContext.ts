import { createContext } from "react";

export const AuthContext = createContext<{
  signIn: (username: string, password: string) => Promise<string | void>;
  signOut: () => void;
  signUp: (username: string, email: string, password: string) => Promise<string | void>;
  confirm: (confirmationCode: string) => Promise<string | void>;
  guestLogin: (username: string) => Promise<string | void>;
  session?: string | null;
  isLoading: boolean;
  applicationId: string | null;
}>({
  signIn: async () => {},
  signOut: () => null,
  signUp: async () => {},
  confirm: async () => {},
  guestLogin: async () => {},
  session: null,
  isLoading: false,
  applicationId: null,
});
