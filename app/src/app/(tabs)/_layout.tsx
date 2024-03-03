import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { Bold } from "@/components/StyledText";
import { SafeAreaView } from "@/components/Themed";
import { useAuth } from "@/hooks/useAuth";
import ChannelsHeader from "@/components/ChannelsHeader";
import { MaterialIcons } from "@expo/vector-icons";
import Fonts from "@/constants/Fonts";
import QuestionAnswer from "@/components/icons/QuestionAnswer";
import Notification from "@/components/icons/Notification";
import Person from "@/components/icons/Person";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string }) {
  return <FontAwesome size={24} style={{ marginBottom: 4 }} {...props} />;
}

export default function TabLayout() {
  const { refreshToken, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <Bold style={{ textAlign: "center" }}>Loading...</Bold>
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
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].mainDarkGrey,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          marginVertical: 8,
          height: 60,
        },
        tabBarLabelStyle: Fonts.regular10,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Channels",
          tabBarIcon: ({ color }) => <MaterialIcons name="grid-view" size={24} color={color} />,
          header: () => <ChannelsHeader />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <QuestionAnswer size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => <Notification size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Person size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
