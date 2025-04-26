import { Platform } from "react-native";
import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import schema, { TableName } from "./model/schema";
import migrations from "./model/migrations";

// import Post from './model/Post' // ⬅️ You'll import your Models here
import Message from "@/model/Message";
import Room from "@/model/Room";
import User from "@/model/User";

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema,
  // (You might want to comment it out for development purposes -- see Migrations documentation)
  // migrations,
  // (optional database name or file system path)
  // dbName: 'myapp',
  // (recommended option, should work flawlessly out of the box on iOS. On Android,
  // additional installation steps have to be taken - disable if you run into issues...)
  // jsi: true /* Platform.OS === 'ios' */,
  // (optional, but you should implement this method)
  onSetUpError: (error) => {
    // Database failed to load -- offer the user to reload the app or log out
  },
});

// Then, make a Watermelon database from it!
export const db = new Database({
  adapter,
  modelClasses: [
    Message,
    Room,
    User,
    // Post, // ⬅️ You'll add Models to Watermelon here
  ],
});

export const roomsCollection = db.get<Room>(TableName.ROOMS);
export const messagesCollection = db.get<Message>(TableName.MESSAGES);
export const usersCollection = db.get<User>(TableName.USERS);

export const resetDatabase = async () => {
  await db.write(async () => {
    await db.unsafeResetDatabase();
  });
};
