import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider } from "@/contexts/AuthProvider";
import Colors from "@/constants/Colors";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "e-Ukraine Regular": require("../../assets/fonts/e-Ukraine Regular.otf"),
    "e-Ukraine Head Bold": require("../../assets/fonts/e-Ukraine Head Bold.otf"),
    "e-Ukraine Head Light": require("../../assets/fonts/e-Ukraine Head Light.otf"),
    "e-Ukraine Head Regular": require("../../assets/fonts/e-Ukraine Head Regular.otf"),
    "icons": require("../../assets/fonts/icons.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ animation: "fade" }}>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            statusBarColor: Colors[colorScheme ?? "light"].background,
            navigationBarColor: Colors[colorScheme ?? "light"].background,
            contentStyle: { backgroundColor: Colors[colorScheme ?? "light"].background },
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            statusBarColor: Colors[colorScheme ?? "light"].mainDarkGrey,
            navigationBarColor: Colors[colorScheme ?? "light"].mainDarkGrey,
            contentStyle: { backgroundColor: Colors[colorScheme ?? "light"].mainDarkGrey },
          }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{
            statusBarColor: Colors[colorScheme ?? "light"].mainDarkGrey,
            navigationBarColor: Colors[colorScheme ?? "light"].background,
            contentStyle: { backgroundColor: Colors[colorScheme ?? "light"].background },
          }}
        />
        <Stack.Screen name="(modals)/create" options={{ presentation: "modal" }} />
        <Stack.Screen name="(modals)/filter" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
