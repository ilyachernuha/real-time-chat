import { createContext, useContext, useState } from "react";
import { useStorageState } from "../hooks/useStorageState";
import authService from "../services/authService";
import useAsyncState from "@/hooks/useAsyncState";

const AuthContext = createContext<{
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

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function AuthProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  // const [applicationId, setApplicationId] = useState<string | null>(null);

  const [[isLoading2, applicationId], setApplicationId] = useAsyncState<string>();

  return (
    <AuthContext.Provider
      value={{
        signIn: async (username, password) => {
          const { token } = await authService.login(username, password);
          setSession(token);
          return token;
        },
        signOut: () => {
          setSession(null);
        },
        signUp: async (username, email, password) => {
          const { applicationId } = await authService.register(username, email, password);
          setApplicationId(applicationId);
          return applicationId;
        },
        confirm: async (confirmationCode) => {
          if (applicationId) {
            const { token } = await authService.confirm(applicationId, confirmationCode);
            setSession(token);
            return token;
          }
        },
        guestLogin: async (username) => {
          const { token } = await authService.guestLogin(username);
          setSession(token);
          return token;
        },
        session,
        isLoading,
        applicationId,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
