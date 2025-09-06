import { TableName } from "@/model/schema";
import { Model, Relation } from "@nozbe/watermelondb";
import { immutableRelation, text } from "@nozbe/watermelondb/decorators";
import Message from "./Message";

export default class Attachment extends Model {
  static table = TableName.ATTACHMENTS;

  @text("server_id") server_id!: string | null;
  @text("uri") uri!: string;
  @text("type") type!: string;
  @text("name") name!: string | null;

  @immutableRelation(TableName.MESSAGES, "message_id") message!: Relation<Message>;
}
