import { createContext, useContext } from "react";
import { useStorageState } from "./hooks/useStorageState";
import authService from "./services/authService";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "./store/chatSlice";

const AuthContext = createContext<{
  signIn: (username: string) => void;
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

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");
  const dispatch = useDispatch();

  return (
    <AuthContext.Provider
      value={{
        signIn: async (username: string) => {
          const user = await authService.login(username);
          setSession(user.token);
          dispatch(setCurrentUser(user));
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
