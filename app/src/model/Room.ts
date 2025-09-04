import Message from "@/model/Message";
import { TableName } from "@/model/schema";
import { Model, Q, Query } from "@nozbe/watermelondb";
import { text, children, lazy, date, writer } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";

type NewMessage = {
    text: string;
    messageId?: string;
    userId: string;
    timestamp: Date;
};

export default class Room extends Model {
    static table = TableName.ROOMS;

    static associations: Associations = {
        [TableName.MESSAGES]: { type: "has_many", foreignKey: "room_id" },
        [TableName.ROOM_USERS]: { type: "has_many", foreignKey: "room_id" },
    };

    @text("title") title!: string;
    @date("last_synced_at") lastSyncedAt!: Date;
    @date("last_message_at") lastMessageAt!: Date;

    @children(TableName.MESSAGES) messages!: Query<Message>;

    @lazy unreadMessages = this.messages.extend(Q.where("is_read", false));

    @lazy sortedMessages = this.messages.extend(Q.sortBy("timestamp_at", Q.desc));

    @lazy lastMessage = this.sortedMessages.extend(Q.take(1));

    @lazy
    users = this.collections.get(TableName.USERS).query(Q.on(TableName.ROOM_USERS, "room_id", this.id));

    @writer async addMessage({ text, timestamp, userId, messageId }: NewMessage) {
        const newMessage = await this.collections.get<Message>(TableName.MESSAGES).create((message) => {
            message.room.set(this);
            message.text = text;
            message.user.id = userId;
            message.timestamp = timestamp;
            if (messageId) {
                message.server_id = messageId;
            }
        });
        await this.update((room) => {
            room.lastMessageAt = timestamp;
        });
        return newMessage;
    }
}
