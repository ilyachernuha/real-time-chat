import { View, StyleSheet, Pressable } from "react-native";
import React, { forwardRef, useMemo } from "react";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import { Button, SecondaryButton } from "../Buttons";
import StyledText from "../StyledText";
import Icons from "../Icons";

const CreateRoomModal = forwardRef<BottomSheetModal>((props, ref) => {
  const snapPoints = useMemo(() => ["50%", "75%"], []);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: Colors.dark.mainDarkGrey }}
      handleIndicatorStyle={{ backgroundColor: Colors.dark.secondaryLightGrey, width: 68, height: 5 }}
      handleStyle={{ justifyContent: "flex-end", paddingTop: 16, paddingBottom: 8 }}
      backdropComponent={BottomSheetBackdrop}
    >
      <View style={styles.container}>
        <View style={{ borderWidth: 1, borderRadius: 12, borderColor: Colors.dark.secondaryLightGrey }}>
          <Pressable>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingLeft: 16,
                paddingVertical: 10,
                paddingRight: 8,
                borderBottomWidth: 1,
                borderColor: Colors.dark.secondaryLightGrey,
              }}
            >
              <StyledText
                font="14"
                darkColor={Colors.dark.secondaryLightGrey}
                lightColor={Colors.light.secondaryLightGrey}
              >
                Themes
              </StyledText>
              <Icons name="drop-down" size={24} color={Colors.dark.secondaryLightGrey} />
            </View>
          </Pressable>
          <Pressable>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingLeft: 16,
                paddingVertical: 10,
                paddingRight: 8,
                borderBottomWidth: 1,
                borderColor: Colors.dark.secondaryLightGrey,
              }}
            >
              <StyledText
                font="14"
                darkColor={Colors.dark.secondaryLightGrey}
                lightColor={Colors.light.secondaryLightGrey}
              >
                Tags
              </StyledText>
              <Icons name="drop-down" size={24} color={Colors.dark.secondaryLightGrey} />
            </View>
          </Pressable>
          <Pressable>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingLeft: 16,
                paddingVertical: 10,
                paddingRight: 8,
              }}
            >
              <StyledText
                font="14"
                darkColor={Colors.dark.secondaryLightGrey}
                lightColor={Colors.light.secondaryLightGrey}
              >
                Languages
              </StyledText>
              <Icons name="drop-down" size={24} color={Colors.dark.secondaryLightGrey} />
            </View>
          </Pressable>
        </View>

        <View style={{ gap: 8 }}>
          <StyledText style={{ alignSelf: "center" }} font="12">
            Choose a type of channel for search
          </StyledText>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, padding: 10 }}>
              <Icons name="radio-button-checked" size={24} color={Colors.dark.mainPurple} />
              <StyledText font="12" darkColor={Colors.dark.mainPurple} lightColor={Colors.light.mainPurple}>
                All
              </StyledText>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, padding: 10 }}>
              <Icons name="radio-button" size={24} color={Colors.dark.secondaryLightGrey} />
              <StyledText
                font="12"
                darkColor={Colors.dark.secondaryLightGrey}
                lightColor={Colors.light.secondaryLightGrey}
              >
                Public
              </StyledText>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, padding: 10 }}>
              <Icons name="radio-button" size={24} color={Colors.dark.secondaryLightGrey} />
              <StyledText
                font="12"
                darkColor={Colors.dark.secondaryLightGrey}
                lightColor={Colors.light.secondaryLightGrey}
              >
                Private
              </StyledText>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <SecondaryButton title="Reset" style={{ flexGrow: 1 }} />
          <Button title="Apply" style={{ flexGrow: 1 }} />
        </View>
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
  },
  buttons: {
    flexDirection: "row",
    gap: 16,
  },
});

export default CreateRoomModal;
