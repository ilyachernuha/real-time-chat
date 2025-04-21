import { db, messagesCollection, roomsCollection } from "@/index.native";
import { refreshAccessToken } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useEffect } from "react";

export const useSocket = () => {
  useEffect(() => {
    const connectSocket = async () => {
      socket.io.opts.extraHeaders = {
        Authorization: `Bearer ${await refreshAccessToken()}`,
      };
      socket.connect();
    };

    connectSocket();
    socket.onAny((event) => {
      console.log(event);
    });
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.io.engine.transport.name);
    });
    socket.on("connect_error", (err) => {
      console.log("⚠️ Socket connect error:", err.message);
    });
    socket.on("disconnect", (e) => {
      console.log("❌ Socket disconnected:", e);
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

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);
};
