import API from "@/constants/API";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/lib/socketTypes";
import { useSocketStore } from "@/stores/socketStore";
import { db, roomsCollection, messagesCollection } from "@/index.native";
import { TokenManager } from "./TokenManager";


const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(API.apiURL, {
    transports: ['websocket'],
    autoConnect: false,
    // reconnection: true,
    // reconnectionAttempts: 10,
    // reconnectionDelay: 1000,
});

const setToken = (token: string) => {
    socket.io.opts.extraHeaders = {
        Authorization: `Bearer ${token}`
    }
}

const connect = async () => {
    const token = await TokenManager.getAccessToken();
    if (!token) return;
    setToken(token);
    socket.connect();
    registerDefaultEvents();
}

const registerDefaultEvents = () => {

    socket.io.on("error", (error) => {
        console.error("[SOCKET] Connection error:", error);
    });


    socket.io.on("ping", () => {
        console.log("[SOCKET] Ping packet is received from the server");
    });


    socket.io.on("reconnect", (attempt) => {
        console.log("[SOCKET] Successful reconnection:", attempt);
    });


    socket.io.on("reconnect_attempt", (attempt) => {
        console.log("[SOCKET] Attempt to reconnect:", attempt);
    });


    socket.io.on("reconnect_error", (error) => {
        console.error("[SOCKET] Reconnection attempt error:", error);
    });


    socket.io.on("reconnect_failed", () => {
        console.error("[SOCKET] Reconnection failed");
    });


    socket.on("connect", () => {
        useSocketStore.getState().setConnected(true);
        console.log("[SOCKET] Socket (re)connected");
    });

    socket.on("connect_error", async (error) => {
        console.error("[SOCKET] Connection error:", error);
        if (error.message === "Token expired") {
            console.log("[SOCKET] Token is expired. Attempting refreshing token and reconnection");
            const token = await TokenManager.refreshAccessToken();
            if (!token) return;
            setToken(token);
            socket.connect();
        }
    });


    socket.on("disconnect", (reason, details) => {
        useSocketStore.getState().setConnected(false);
        console.log("[SOCKET] Disconnected:", reason, details);
        if (reason === "io server disconnect") {
            socket.connect();
        }
    });

    socket.on("message", async ({ message_id, text, user: { id: user_id }, timestamp, room_id }) => {
        const date = new Date(timestamp * 1000);
        const room = await roomsCollection.find(room_id);

        await db.write(async () => {
            const messageUpdate = messagesCollection.prepareCreate((msg) => {
                msg.room.id = room_id;
                msg.user.id = user_id;
                msg._raw.id = message_id;
                msg.text = text;
                msg.timestamp = date;
                msg._raw._status = "synced";
            });

            const roomUpdate = room.prepareUpdate((room) => {
                room.lastMessageAt = date;
                room._raw._status = "synced";
            });

            await db.batch([messageUpdate, roomUpdate]);
        });
    });
}

const disconnect = () => {
    socket.disconnect();
    socket.removeAllListeners();
}

const emit = <K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
) => {
    socket.emit(event, ...args);

};

export const SocketService = {
    connect,
    disconnect,
    emit
}
