import React from "react";
import { Redirect, Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { SafeAreaView } from "@/components/Themed";
import ChannelsHeader from "@/features/rooms/screens/components/ChannelsHeader";
import Fonts from "@/constants/Fonts";
import StyledText from "@/components/StyledText";
import Icons from "@/components/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/features/auth/services/authStore";
import { useSocket } from "@/hooks/useSocket";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (!hasHydrated) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <StyledText font="bold" style={{ textAlign: "center" }}>
          Loading...
        </StyledText>
      </SafeAreaView>
    );
  }

  const accessToken = useAuthStore((state) => state.accessToken);
  useSocket();

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!accessToken) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].secondaryLightGrey,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].mainPurple,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].mainDarkGrey,
          borderColor: Colors[colorScheme ?? "light"].mainDarkGrey,
          height: 60 + insets.bottom,
        },
        headerTitleAlign: "center",
        tabBarLabelStyle: Fonts[10],
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].mainDarkGrey,
        },
        headerTitleStyle: {
          color: Colors[colorScheme ?? "light"].text,
          fontFamily: Fonts[14].fontFamily,
          fontSize: Fonts[14].fontSize,
          fontWeight: Fonts[14].fontWeight,
        },
        headerTintColor: Colors[colorScheme ?? "light"].text,
        headerBackTitleStyle: {
          fontFamily: Fonts[14].fontFamily,
          fontSize: Fonts[14].fontSize,
        },
        sceneStyle: {
          backgroundColor: Colors.dark.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitleAlign: "center",
          title: "Rooms",
          tabBarIcon: ({ color }) => <Icons name="browse" size={24} color={color} />,
          header: () => <ChannelsHeader top={insets.top + 8} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          headerTitleAlign: "center",
          title: "Chats",
          tabBarIcon: ({ color }) => <Icons name="chats" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          headerTitleAlign: "center",
          title: "Notifications",
          tabBarIcon: ({ color }) => <Icons name="notifications" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitleAlign: "center",
          title: "Profile",
          tabBarIcon: ({ color }) => <Icons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
