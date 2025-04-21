import Room from "@/model/Room";
import { TableName } from "@/model/schema";
import User from "@/model/User";
import { Model, Relation } from "@nozbe/watermelondb";
import { immutableRelation } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";

export default class RoomUser extends Model {
  static table = TableName.ROOM_USERS;

  static associations: Associations = {
    [TableName.ROOMS]: { type: "belongs_to", key: "room_id" },
    [TableName.USERS]: { type: "belongs_to", key: "user_id" },
  };
  @immutableRelation(TableName.ROOMS, "post_id") room!: Relation<Room>;
  @immutableRelation(TableName.USERS, "user_id") user!: Relation<User>;
}
