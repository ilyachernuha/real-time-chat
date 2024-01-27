import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
import axios from "axios";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export default function App() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleLogin = async () => {
    try {
      const { data } = await axios.post(`${apiUrl}/create_user/`, {
        name: username,
      });
      setToken(data.token);
      setUserId(data.user_id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    setToken(null);
  };

  return token ? (
    <View style={styles.container}>
      <Text>You are now logged as {userId}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  ) : (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
