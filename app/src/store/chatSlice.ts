import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage, ChatMessageReceive, CurrentUser, User } from "../types";

interface ChatState {
  messages: ChatMessageReceive[];
  currentUser: CurrentUser | null;
}

const initialState: ChatState = {
  messages: [],
  currentUser: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    receiveMessage: (state, action: PayloadAction<ChatMessageReceive>) => {
      state.messages.push(action.payload);
    },
    setCurrentUser: (state, action: PayloadAction<CurrentUser>) => {
      state.currentUser = action.payload;
    },
  },
});

export const { receiveMessage, setCurrentUser } = chatSlice.actions;

export default chatSlice.reducer;
