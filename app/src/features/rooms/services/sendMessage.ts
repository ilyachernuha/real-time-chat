import { useAuthStore } from "@/features/auth/services/authStore";
import { db } from "@/index.native";
import { SocketService } from "@/lib/SocketService";
import Room from "@/model/Room";

export const sendMessage = async (text: string, room: Room) => {
    if (!text.trim()) return;

    const timestamp = new Date();

    try {
        // const message = await db.write(async () => {
        const message = await room.addMessage({
            text: text,
            timestamp: timestamp,
            userId: useAuthStore.getState().user?.id!,
        });
        // });

        SocketService.emit("message",
            { room_id: room.id, text },
            async (status, { message_id, timestamp }) => {
                if (status == "Error") {
                    console.error("FAILED TO SEND THE MESSAGE");
                    return;
                }
                const date = new Date(timestamp * 1000);
                // await room.updateLastMessageAt(date);

                await db.write(async () => {
                    const messageUpdate = message.prepareUpdate((message) => {
                        message._raw.id = message_id;
                        message.timestamp = date;
                        message._raw._status = "synced";
                    });
                    const roomUpdate = room.prepareUpdate((room) => {
                        room.lastMessageAt = date;
                        room._raw._status = "synced";
                    });
                    await db.batch([messageUpdate, roomUpdate]);
                });
            });
    } catch (error) {
        console.error(error);
    }
};
