// model/schema.js
import { appSchema, tableSchema } from "@nozbe/watermelondb";

export enum TableName {
  ROOMS = "rooms",
  MESSAGES = "messages",
  USERS = "users",
  ROOM_USERS = "room_users",
}

export default appSchema({
  version: 20,
  tables: [
    tableSchema({
      name: TableName.ROOMS,
      columns: [
        { name: "title", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "last_synced_at", type: "number" },
        { name: "last_message_at", type: "number" },
      ],
    }),
    tableSchema({
      name: TableName.MESSAGES,
      columns: [
        { name: "text", type: "string" },
        { name: "timestamp_at", type: "number" },
        { name: "room_id", type: "string" },
        { name: "user_id", type: "string" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "is_read", type: "boolean" },
      ],
    }),
    tableSchema({
      name: TableName.USERS,
      columns: [
        { name: "name", type: "string" },
        { name: "username", type: "string" },
      ],
    }),
    tableSchema({
      name: TableName.ROOM_USERS,
      columns: [
        { name: "room_id", type: "string" },
        { name: "user_id", type: "string" },
      ],
    }),
  ],
});
