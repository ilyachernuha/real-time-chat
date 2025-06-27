import { create } from "zustand";

type SocketStore = {
    connected: boolean;
    setConnected: (connected: boolean) => void;
};

export const useSocketStore = create<SocketStore>()(
    (set, get) => ({
        connected: false,
        setConnected: (connected) => set({ connected })
    })
);
