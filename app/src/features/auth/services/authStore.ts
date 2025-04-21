import { zustandStorage } from "@/lib/mmkv";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
}

type LoginPayload = {
  user: User;
  session: string;
  accessToken: string;
  refreshToken: string;
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthStore = {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  user: User | null;
  session: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (payload: LoginPayload) => void;
  logout: () => void;
  setAuthTokens: (tokens: Tokens) => void;
  clearTokens: () => void;
  setUser: (user: User) => void;
  setSession: (session: string) => void;
  refreshingTokens: boolean;
  setRefreshingTokens: (refreshingTokens: boolean) => void;
  emailApplicationId: string | null;
  setEmailApplicationId: (emailApplicationId: string) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
      login: ({ user, session, accessToken, refreshToken }) => set({ user, session, accessToken, refreshToken }),
      logout: () => set({ user: null, session: null, accessToken: null, refreshToken: null }),
      setAuthTokens: ({ refreshToken, accessToken }) => set({ refreshToken, accessToken }),
      clearTokens: () => set({ accessToken: null, refreshToken: null }),
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      refreshingTokens: false,
      setRefreshingTokens: (refreshingTokens) => set({ refreshingTokens }),
      emailApplicationId: null,
      setEmailApplicationId: (emailApplicationId) => set({ emailApplicationId }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
