import { useStorageState } from "../hooks/useStorageState";
import { AuthContext } from "./AuthContext";
import { useEffect, useState } from "react";
import AuthService from "@/services/AuthService";
import UserService from "@/services/UserService";

export function AuthProvider(props: React.PropsWithChildren) {
  const [[isAccessTokenLoading, accessToken], setAccessToken] = useStorageState("accessToken");
  const [[isRefreshTokenLoading, refreshToken], setRefreshToken] = useStorageState("refreshToken");
  const [[isSessionIdLoading, sessionId], setSessionId] = useStorageState("sessionId");
  const [[isUserIdLoading, userId], setUserId] = useStorageState("userId");
  const [[isUsernameLoading, username], setUsername] = useStorageState("username");
  const [[isNameLoading, name], setName] = useStorageState("name");

  useEffect(() => {
    console.log("refreshToken:", refreshToken);
  }, [refreshToken]);

  useEffect(() => {
    console.log("accessToken:", accessToken);
  }, [refreshToken]);

  const [applicationId, setApplicationId] = useState<string | null>(null);

  const value: AuthContext = {
    signIn: async (credentials) => {
      const { access_token, refresh_token, session_id, user_id } = await AuthService.login(credentials);
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setUserId(user_id);
      setSessionId(session_id);
      setUsername(credentials.username);
    },
    guestLogin: async (name) => {
      const { access_token, refresh_token, session_id, user_id } = await AuthService.guestLogin(name);
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setUserId(user_id);
      setSessionId(session_id);
      setName(name);
    },
    signOut: async () => {
      setAccessToken(null);
      setRefreshToken(null);
      setUserId(null);
      setSessionId(null);
      setUsername(null);
      setName(null);
    },
    signUp: async (credentials) => {
      const { application_id } = await AuthService.register(credentials);
      setApplicationId(application_id);
      setUsername(credentials.username);
    },
    confirm: async (confirmationCode) => {
      if (applicationId) {
        const { access_token, refresh_token, session_id, user_id } = await AuthService.confirmRegistration({
          application_id: applicationId,
          confirmation_code: confirmationCode,
        });
        setAccessToken(access_token);
        setRefreshToken(refresh_token);
        setUserId(user_id);
        setSessionId(session_id);
      }
    },
    forgotPassword: async (email) => {
      await AuthService.forgotPassword(email);
    },
    resetPassword: async (credentials) => {
      await AuthService.resetPassword(credentials);
    },
    refreshToken,
    isLoading: isRefreshTokenLoading,
    sessionId,
    userId,
    username,
    name,
    changeName: async (name) => {
      const { new_name } = await UserService.changeName(name);
      setName(new_name);
    },
  };

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}
