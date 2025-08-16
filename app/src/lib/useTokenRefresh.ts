import { useEffect } from "react"
import { TokenManager } from "./TokenManager";

export const useTokenRefresh = () => {
    useEffect(() => {
        TokenManager.scheduleTokenRefresh();
        return () => {
            TokenManager.cancelTokenRefresh();
        }
    }, [])
}
