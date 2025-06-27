import { Button } from "@/components/buttons/Buttons";
import Colors from "@/constants/Colors";
import { logout } from "@/features/auth/services/logout";
import { useAuthStore } from "@/features/auth/services/authStore";
import { View, Text, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSocketStore } from "@/stores/socketStore";
import { useEffect, useState } from "react";
import { TokenManager } from "@/lib/TokenManager";

export const ProfileScreen = () => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const connected = useSocketStore((state) => state.connected);
    const accessTokenPayload = useAuthStore((state) => state.accessTokenPayload);

    if (!accessTokenPayload) {
        return (
            <Text style={styles.text}>Loading user data...</Text>
        );
    }

    const { session_id, user_id, exp } = accessTokenPayload;

    const [timeToExp, setTimeToExp] = useState(0);


    function formatDuration(ms: number) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    useEffect(() => {
        const updateExpTime = () => {
            setTimeToExp(TokenManager.tokenTimeLeft());
        }
        updateExpTime();
        const interval = setInterval(updateExpTime, 1000);
        return () => clearInterval(interval);
    }, [accessTokenPayload]);


    return (
        <KeyboardAwareScrollView>
            <View style={{ padding: 24, gap: 24 }}>
                <Text style={styles.text}>User ID: {user_id}</Text>
                <Text style={styles.text}>Session ID: {session_id}</Text>
                <Text style={styles.text}>AccessToken: {accessToken}</Text>
                <Text style={styles.text}>RefreshToken: {refreshToken}</Text>
                <Text style={styles.text}>Socket State: {connected ? "✅ CONNECTED" : "❌ DISCONNECTED"}</Text>
                <Text style={styles.text}>Token expiration time: {new Date(exp * 1000).toLocaleTimeString()}</Text>
                <Text style={styles.text}>Time to expire: {timeToExp > 0 ? formatDuration(timeToExp) : "EXPIRED"}</Text>
                <View style={{ gap: 24 }}>
                    <Button title="Log Out" onPress={() => logout()} />
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    text: {
        color: Colors.dark.text,
    },
});
