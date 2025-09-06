import Room from "@/model/Room";
import { TableName } from "@/model/schema";
import User from "@/model/User";
import { Model, Query, Relation } from "@nozbe/watermelondb";
import { children, date, immutableRelation, readonly, text, writer } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import Attachment from "./Attachment";

export default class Message extends Model {
  static table = TableName.MESSAGES;

  static associations: Associations = {
    [TableName.ROOMS]: { type: "belongs_to", key: "room_id" },
    [TableName.USERS]: { type: "belongs_to", key: "user_id" },
    [TableName.ATTACHMENTS]: { type: "has_many", foreignKey: "message_id" },
  };

  @text("server_id") server_id!: string | null;
  @text("text") text!: string;
  @date("timestamp_at") timestamp!: Date;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @children(TableName.ATTACHMENTS) attachments!: Query<Attachment>;

  @immutableRelation(TableName.ROOMS, "room_id") room!: Relation<Room>;
  @immutableRelation(TableName.USERS, "user_id") user!: Relation<User>;

  @writer async sync(server_id: string, timestamp: Date) {
    const updateMessage = this.prepareUpdate((message) => {
      message.server_id = server_id;
      message.timestamp = timestamp;
    });

    const room = await this.room.fetch();

    const updateRoom = room.prepareUpdate((room) => {
      room.lastMessageAt = timestamp;
    });

    await this.batch(updateMessage, updateRoom);
  }
}
