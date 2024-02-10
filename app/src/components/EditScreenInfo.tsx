import React from "react";
import { StyleSheet } from "react-native";

import { ExternalLink } from "./ExternalLink";
import { RegularText } from "./StyledText";
import { Text, View } from "./Themed";

import Colors from "@/constants/Colors";
import { Button } from "./Buttons";
import { useSession } from "@/providers/AuthProvider";

export default function EditScreenInfo({ path }: { path: string }) {
  const { signOut } = useSession();
  const onSignOut = () => {
    signOut();
  };
  return (
    <View>
      <Button onPress={onSignOut} title="Sign Out" />
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: "center",
  },
});
