import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../store/chatSlice";
import { User } from "../types";
import authService from "../services/authService";

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (username.trim()) {
      try {
        const user = await authService.login(username);
        dispatch(setCurrentUser(user));
        // Navigate to chat screen or elsewhere as needed
      } catch (error) {
        console.error(error);
        // Handle login error (e.g., show error message)
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 40,
  },
});

export default LoginScreen;
