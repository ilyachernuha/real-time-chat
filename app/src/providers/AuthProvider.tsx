import { createContext, useContext } from "react";
import { useStorageState } from "../hooks/useStorageState";
import authService from "../services/authService";

const AuthContext = createContext<{
  signIn: (username: string) => null | Promise<boolean>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
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

  return (
    <AuthContext.Provider
      value={{
        signIn: async (username: string) => {
          let success = false;
          try {
            const user = await authService.login(username);
            setSession(user.token);
            success = true;
          } catch (error) {
            success = false;
          }
          return success;
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
