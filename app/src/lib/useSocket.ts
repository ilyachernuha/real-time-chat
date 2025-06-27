import { useEffect } from "react";
import { SocketService } from "./SocketService";


export const useSocket = () => {
    useEffect(() => {
        SocketService.connect();
        return () => {
            SocketService.disconnect();
        };
    }, []);
};

