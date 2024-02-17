import React from "react";
import { Text, View } from "./Themed";
import { Button } from "./Buttons";
import { useAuth } from "@/hooks/useAuth";

export default function EditScreenInfo({ path }: { path: string }) {
  const { signOut } = useAuth();

  return (
    <View>
      <Text>Email:</Text>
      <Text>Username:</Text>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  );
}
