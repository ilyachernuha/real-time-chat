import "ts-node/register";
import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Whisper",
  slug: "real-time-chat",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "whisper",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#030708",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.teamchallenge.realtimechat",
    backgroundColor: "#030708",
  },
  android: {
    backgroundColor: "#030708",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundImage: "./assets/images/background-image.png",
      monochromeImage: "./assets/images/monochrome-image.png",
      backgroundColor: "#1F1F1F",
    },
    package: "com.teamchallenge.realtimechat",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "happytown.store",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    softwareKeyboardLayoutMode: "pan",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  extra: {
    eas: {
      projectId: "d06a97c0-7847-41ec-8068-0df714fd7f3e",
    },
  },
  owner: "team-challenge",
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/d06a97c0-7847-41ec-8068-0df714fd7f3e",
  },
  plugins: [
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/e-Ukraine Regular.otf",
          "./assets/fonts/e-Ukraine Head Bold.otf",
          "./assets/fonts/e-Ukraine Head Light.otf",
          "./assets/fonts/e-Ukraine Head Regular.otf",
        ],
      },
    ],
    "expo-router",
    "expo-secure-store",
  ],
  experiments: {
    typedRoutes: true,
  },
  backgroundColor: "#030708",
};

export default config;
