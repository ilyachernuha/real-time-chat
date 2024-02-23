import { useStorageState } from "../hooks/useStorageState";
import { AuthContext } from "./AuthContext";
import { useState } from "react";
import AuthService from "@/services/AuthService";

export function AuthProvider(props: React.PropsWithChildren) {
  const [[isLoading, token], setToken] = useStorageState("token");

  const [applicationId, setApplicationId] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (credentials) => {
          const { token } = await AuthService.login(credentials);
          setToken(token);
        },
        signOut: async () => {
          setToken(null);
        },
        signUp: async (credentials) => {
          const { application_id } = await AuthService.register(credentials);
          setApplicationId(application_id);
        },
        confirm: async (confirmationCode) => {
          if (applicationId) {
            const { token } = await AuthService.confirm({
              application_id: applicationId,
              confirmation_code: confirmationCode,
            });
            setToken(token);
          }
        },
        guestLogin: async (username) => {
          const { token } = await AuthService.guestLogin({ name: username });
          setToken(token);
        },
        forgotPassword: async (email) => {
          await AuthService.forgotPassword({ email });
        },
        resetPassword: async (credentials) => {
          await AuthService.resetPassword(credentials);
        },
        token,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
