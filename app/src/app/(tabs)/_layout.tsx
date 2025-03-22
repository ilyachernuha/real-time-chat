import React from "react";
import { Redirect, Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { SafeAreaView } from "@/components/Themed";
import { useAuth } from "@/hooks/useAuth";
import ChannelsHeader from "@/components/ChannelsHeader";
import Fonts from "@/constants/Fonts";
import StyledText from "@/components/StyledText";
import Icons from "@/components/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { refreshToken, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <StyledText font="bold" style={{ textAlign: "center" }}>
          Loading...
        </StyledText>
      </SafeAreaView>
    );
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!refreshToken) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].secondaryLightGrey,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].mainPurple,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].mainDarkGrey,
          borderColor: Colors[colorScheme ?? "light"].mainDarkGrey,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: Fonts[10],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Channels",
          tabBarIcon: ({ color }) => <Icons name="browse" size={24} color={color} />,
          header: () => <ChannelsHeader top={insets.top + 8} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <Icons name="chats" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => <Icons name="notifications" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Icons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
