import Message from "@/model/Message";
import { TableName } from "@/model/schema";
import { Model, Q, Relation } from "@nozbe/watermelondb";
import { children, lazy, text } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";

export default class User extends Model {
  static table = TableName.USERS;

  static associations: Associations = {
    [TableName.MESSAGES]: { type: "has_many", foreignKey: "user_id" },
    [TableName.ROOM_USERS]: { type: "has_many", foreignKey: "user_id" },
  };

  @text("name") name!: string;
  @text("username") username!: string;

  @children(TableName.MESSAGES) messages!: Relation<Message>;

  @lazy
  rooms = this.collections.get(TableName.ROOMS).query(Q.on(TableName.ROOM_USERS, "user_id", this.id));
}
