export type ChatMessage = {
  text: string;
  room: string;
};

export type ChatMessageReceive = ChatMessage & {
  user: User;
  timestamp: string;
};

export type User = {
  id: string;
  name: string;
};

export type CurrentUser = User & {
  token: string;
};
