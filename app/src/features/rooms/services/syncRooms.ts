import { roomsApi } from "@/features/rooms/services/roomsApi";
import { db, messagesCollection, roomsCollection, usersCollection } from "@/index.native";

export const syncRooms = async () => {
    try {
        // 1. Get rooms from API
        const { rooms: remoteRooms } = await roomsApi.myRooms();

        // 2. Load existing rooms from DB
        const existingRooms = new Map((await roomsCollection.query().fetch()).map((room) => [room.id, room]));
        const existingMessagesIds = new Set((await messagesCollection.query().fetch()).map(message => message.server_id));
        const existingUsers = new Map((await usersCollection.query().fetch()).map((user) => [user.id, user]));
        const usersIdsToFetch = new Set<string>();

        // 3. Prepare lastSyncedAt map
        const roomSyncTimestamps = new Map<string, number>(); // IN SECONDS

        for (const room of remoteRooms) {
            const existing = existingRooms.get(room.room_id);
            if (existing) {
                roomSyncTimestamps.set(room.room_id, existing.lastSyncedAt.getTime() / 1000);
            } else {
                roomSyncTimestamps.set(room.room_id, 0);
            }
        }

        // 4. Fetch new/updated messages for each room concurrently
        const messagesPromises = remoteRooms.map(async ({ room_id }) => {
            const after = roomSyncTimestamps.get(room_id) ?? 0;
            const updates = await roomsApi.syncRoomMessages({ room_id, after });
            return [room_id, updates] as const;
        });

        const updates = new Map(await Promise.all(messagesPromises));

        const newSyncTimestamps = new Map<string, number>();

        // 5.3 Update lastSyncedAt for room
        for (const { room_id } of remoteRooms) {
            const room = updates.get(room_id);
            if (room) {
                const timestamp = Math.max(
                    ...[...room.new_messages.map((r) => r.created_at), ...room.updated_messages.map((r) => r.updated_at)]
                );
                newSyncTimestamps.set(room_id, timestamp * 1000); // IN MILISECONDS
            }
        }

        // 5. Write everything to DB in a single transaction
        await db.write(async () => {
            const operations = [];

            // 5.1 Prepare room creations/updates
            const roomOperations = remoteRooms.map(({ room_id, title }) => {
                const existing = existingRooms.get(room_id);
                const timestamp = newSyncTimestamps.get(room_id);

                if (existing) {
                    return existing.prepareUpdate((room) => {
                        room.title = title;
                        if (timestamp) {
                            room.lastSyncedAt = new Date(timestamp);
                            room.lastMessageAt = new Date(timestamp);
                        }
                    });
                } else {
                    return roomsCollection.prepareCreate((room) => {
                        room._raw.id = room_id;
                        room.title = title;
                        room._raw._status = "synced";
                        if (timestamp) {
                            room.lastSyncedAt = new Date(timestamp);
                            room.lastMessageAt = new Date(timestamp);
                        }
                    });
                }
            });

            operations.push(...roomOperations);

            // 5.2 Prepare message creates/updates
            for (const [roomId, update] of updates) {
                const { new_messages, updated_messages } = update;

                // Create new messages
                for (const msg of new_messages) {
                    usersIdsToFetch.add(msg.user_id);
                    if (existingMessagesIds.has(msg.message_id)) continue;
                    const op = messagesCollection.prepareCreateFromDirtyRaw({
                        server_id: msg.message_id,
                        room_id: roomId,
                        user_id: msg.user_id,
                        text: msg.text,
                        timestamp_at: msg.created_at * 1000
                    })
                    operations.push(op);
                }

                // Update existing messages
                for (const msg of updated_messages) {
                    const existingMessage = await messagesCollection.find(msg.message_id).catch(() => null);
                    if (existingMessage) {
                        const op = existingMessage.prepareUpdate((message) => {
                            message.text = msg.text;
                            message.timestamp = new Date(msg.updated_at * 1000);
                        });
                        operations.push(op);
                    }
                }
            }

            const usersPromises = Array.from(usersIdsToFetch).map(async (userId) => {
                const user = await roomsApi.user(userId);
                return { userId, ...user };
            });

            const users = await Promise.all(usersPromises);

            const usersOperations = users.map(({ userId, username, name }) => {
                const existingUser = existingUsers.get(userId);

                if (existingUser) {
                    return existingUser.prepareUpdate((user) => {
                        user.name = name;
                        user.username = username;
                        user._raw._status = "synced";
                    });
                }

                return usersCollection.prepareCreate((user) => {
                    user._raw.id = userId;
                    user.name = name;
                    user.username = username;
                    user._raw._status = "synced";
                });
            });

            operations.push(...usersOperations);

            await db.batch(operations);
        });
    } catch (error) {
        console.error(error);
    }
};
