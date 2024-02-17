import { useStorageState } from "../hooks/useStorageState";
import { AuthContext } from "./AuthContext";
import { useState } from "react";
import AuthService from "@/services/AuthService";

export function AuthProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  const [applicationId, setApplicationId] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (username, password) => {
          const { token } = await AuthService.login(username, password);
          setSession(token);
        },
        signOut: () => {
          setSession(null);
        },
        signUp: async (username, email, password) => {
          const { applicationId } = await AuthService.register(username, email, password);
          setApplicationId(applicationId);
        },
        confirm: async (confirmationCode) => {
          if (applicationId) {
            const { token } = await AuthService.confirm(applicationId, confirmationCode);
            setSession(token);
          }
        },
        guestLogin: async (username) => {
          const { token } = await AuthService.guestLogin(username);
          setSession(token);
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
