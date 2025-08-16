import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { SocketService } from './SocketService';
import { TokenManager } from './TokenManager';


export const useAppState = () => {

    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('[APP] App has come to the foreground');
                SocketService.connect();
                TokenManager.scheduleTokenRefresh();

            } else if (
                appState.current == 'active' &&
                nextAppState.match(/inactive|background/)
            ) {
                console.log('[APP] App has come to the background');
                SocketService.disconnect();
                // TokenManager.cancelTokenRefresh();

            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);
};

