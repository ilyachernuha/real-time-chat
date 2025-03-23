import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider } from "@/contexts/AuthProvider";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { StatusBar } from "expo-status-bar";

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

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
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
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: Colors[colorScheme ?? "light"].background },
          headerShown: false,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].mainDarkGrey,
          },
          headerTitleStyle: {
            color: Colors[colorScheme ?? "light"].text,
            fontFamily: Fonts[14].fontFamily,
            fontSize: Fonts[14].fontSize,
            fontWeight: Fonts[14].fontWeight,
          },
          headerTintColor: Colors[colorScheme ?? "light"].mainPurple,
          headerTitleAlign: "center",
          headerBackTitleStyle: {
            fontFamily: Fonts[14].fontFamily,
            fontSize: Fonts[14].fontSize,
          },
          statusBarTranslucent: true,
          statusBarBackgroundColor: "transparent",
          statusBarStyle: "light",
          navigationBarTranslucent: true,
          navigationBarColor: "transparent",
          animation: "fade",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" options={{ headerTitleAlign: "center" }} />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </ThemeProvider>
  );
}
