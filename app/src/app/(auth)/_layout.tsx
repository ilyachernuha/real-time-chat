import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="forgot" />
      <Stack.Screen name="reset" />
    </Stack>
  );
}
