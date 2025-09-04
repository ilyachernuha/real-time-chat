import { useAuthStore } from "@/features/auth/services/authStore";
import { socket } from "@/lib/socket";
import Room from "@/model/Room";

export const sendMessage = async (text: string, room: Room) => {
    if (!text.trim()) return;

    const timestamp = new Date();

    try {
        const message = await room.addMessage({
            text: text,
            timestamp: timestamp,
            userId: useAuthStore.getState().user?.id!,
        });

        socket.emit("message", { room_id: room.id, text }, async (status, { message_id, timestamp }) => {
            if (status == "Error") {
                console.error("FAILED TO SEND THE MESSAGE");
                return;
            }
            const date = new Date(timestamp * 1000);
            await message.sync(message_id, date);
        });
    } catch (error) {
        console.error(error);
    }
};
