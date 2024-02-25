import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="guest" />
      <Stack.Screen name="register" />
      <Stack.Screen name="confirm/[email]" />
      <Stack.Screen name="forgot" />
      <Stack.Screen name="reset/[token]" />
    </Stack>
  );
}
