export interface ClientToServerEvents {
    find_rooms: FindRoomsEvent;
    message: SendMessageEvent;
}

export interface ServerToClientEvents {
    message: (data: ReceiveMessageEventData) => void;
}

type User = {
    id: string;
    name: string;
    profile_picture_id: string;
};

type ReceiveMessageEventData = {
    message_id: string;
    user: User;
    text: string;
    room_id: string;
    timestamp: number;
};

type SendMessageEventData = {
    text: string;
    room_id: string;
};

type SendMessageEventResponse = {
    message_id: string;
    timestamp: number;
};

type Status = "Success" | "Error";

type Room = {
    room_id: string;
    title: string;
    room_picture_id: string;
};

type FindRoomsEventData = {
    search: string;
    themes?: [];
    tags?: [];
    languages?: [];
    public?: boolean;
};

type FindRoomsEventRespone = {
    rooms: Room[];
};

type FindRoomsEvent = (
    data: FindRoomsEventData,
    ack?: (status: Status, response: FindRoomsEventRespone) => void
) => void;

type SendMessageEvent = (
    data: SendMessageEventData,
    ack?: (status: Status, response: SendMessageEventResponse) => void
) => void;
