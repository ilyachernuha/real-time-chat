import React, { useCallback } from "react";
import { Provider } from "react-redux";
import store from "./src/store/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";

const App = () => {
  SplashScreen.preventAutoHideAsync();

  const [fontsLoaded, fontError] = useFonts({
    "e-Ukraine Regular": require("./assets/fonts/e-Ukraine Regular.otf"),
    "e-Ukraine Head Bold": require("./assets/fonts/e-Ukraine Head Bold.otf"),
    "e-Ukraine Head Light": require("./assets/fonts/e-Ukraine Head Light.otf"),
    "e-Ukraine Head Regular": require("./assets/fonts/e-Ukraine Head Regular.otf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
};

export default App;
