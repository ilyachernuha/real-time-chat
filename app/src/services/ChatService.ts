import io, { Socket } from "socket.io-client";
import { ChatMessage, ChatMessageReceive } from "../types";
import API from "@/constants/API";

class ChatService {
  
  private socket: Socket;

  constructor() {
    this.socket = io(API.apiURL, { autoConnect: false });
  }

  connect(token: string) {
    this.socket.auth = { token: token };
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  subscribeToMessages(callback: (message: ChatMessageReceive) => void) {
    this.socket.on("message", callback);
    return () => this.socket.off("message", callback);
  }

  sendMessage(message: ChatMessage) {
    this.socket.emit("message", message);
  }
}

export default new ChatService();
