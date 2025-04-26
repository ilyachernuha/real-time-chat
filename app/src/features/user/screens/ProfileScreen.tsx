import { Button } from "@/components/buttons/Buttons";
import Colors from "@/constants/Colors";
import { logout } from "@/features/auth/services/logout";
import { useAuthStore } from "@/features/auth/services/authStore";
import { socket } from "@/lib/socket";
import { View, Text, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export const ProfileScreen = () => {
  const session = useAuthStore((state) => state.session);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const userId = useAuthStore((state) => state.user?.id);

  return (
    <KeyboardAwareScrollView>
      <View style={{ padding: 24, gap: 24 }}>
        <Text style={styles.text}>User ID: {userId}</Text>
        <Text style={styles.text}>Session ID: {session}</Text>
        <Text style={styles.text}>AccessToken: {accessToken}</Text>
        <Text style={styles.text}>RefreshToken: {refreshToken}</Text>
        <Text style={styles.text}>Socket State: {socket.connected ? "✅ CONNECTED" : "❌ DISCONNECTED"}</Text>
        <Text style={styles.text}>Socket State: {!socket.disconnected ? "✅ CONNECTED" : "❌ DISCONNECTED"}</Text>
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
