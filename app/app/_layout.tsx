import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import store from "../src/store/store";
import { Provider } from "react-redux";
import { SessionProvider } from "../src/ctx";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    "e-Ukraine Regular": require("../assets/fonts/e-Ukraine Regular.otf"),
    "e-Ukraine Head Bold": require("../assets/fonts/e-Ukraine Head Bold.otf"),
    "e-Ukraine Head Light": require("../assets/fonts/e-Ukraine Head Light.otf"),
    "e-Ukraine Head Regular": require("../assets/fonts/e-Ukraine Head Regular.otf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <SessionProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
            }}
          />
          <StatusBar style="light" />
        </SafeAreaProvider>
      </SessionProvider>
    </Provider>
  );
}
