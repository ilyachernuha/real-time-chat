import { useEffect } from 'react';
import { addNetworkStateListener } from 'expo-network';
import { SocketService } from './SocketService';
import { TokenManager } from './TokenManager';

export const useNetworkState = () => {
    useEffect(() => {

        const subscription = addNetworkStateListener(({ isConnected, isInternetReachable }) => {
            if (isConnected && isInternetReachable) {
                console.log('[APP] Network is connection is back');
                SocketService.connect();
                TokenManager.scheduleTokenRefresh();
            } else {
                console.log('[APP] Network connection is lost');
                SocketService.disconnect();
            }
        });

        return () => subscription.remove();

    }, []);
}

