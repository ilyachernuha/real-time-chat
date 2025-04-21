import Icons from "@/components/Icons";
import StyledText from "@/components/StyledText";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useDropdownStore } from "@/stores/dropdownStore";
import { getBorderColor, getColor } from "@/utils/getActionColor";
import React, { PropsWithChildren } from "react";
import { View, Text, Pressable, Keyboard } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

type DropdownProps = PropsWithChildren<{
  id: string;
  value?: string;
  placeholder?: string;
  error?: string;
  zIndex?: number;
}>;

export const Dropdown = ({ id, value, placeholder, children, error, zIndex }: DropdownProps) => {
  const { openDropdownId, openDropdown, closeDropdown } = useDropdownStore();
  const isOpen = openDropdownId === id;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 1 : 0, { duration: 200 }),
    transform: [{ scale: withTiming(isOpen ? 1 : 0.95, { duration: 200 }) }],
  }));

  const toggle = () => {
    Keyboard.dismiss();
    isOpen ? closeDropdown() : openDropdown(id);
  };

  return (
    <View style={{ paddingBottom: 24 }}>
      <Pressable
        onPress={toggle}
        style={{
          borderWidth: 1,
          borderColor: getBorderColor({ value, error }),
          paddingLeft: 16,
          paddingRight: 8,
          borderRadius: 12,
          borderBottomLeftRadius: isOpen ? 0 : 12,
          borderBottomRightRadius: isOpen ? 0 : 12,
          backgroundColor: Colors.dark.mainDarkGrey,
          height: 44,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            flex: 1,
            color: value ? getColor({ value, error }) : Colors.dark.secondaryLightGrey,
            ...Fonts[14],
          }}
        >
          {value || placeholder}
        </Text>
        {isOpen ? (
          <Icons name="drop-up" color={value ? Colors.dark.text : Colors.dark.secondaryLightGrey} />
        ) : (
          <Icons name="drop-down" color={value ? Colors.dark.text : Colors.dark.secondaryLightGrey} />
        )}
      </Pressable>
      {error && (
        <StyledText
          font="light"
          style={{ position: "absolute", bottom: 0, paddingVertical: 5, color: Colors.dark.mainErrorRed }}
        >
          {error}
        </StyledText>
      )}

      {isOpen && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 44,
              left: 0,
              right: 0,
              backgroundColor: Colors.dark.mainDarkGrey,
              borderWidth: 1,
              borderColor: Colors.dark.secondaryLightGrey,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              zIndex: zIndex,
            },
            animatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
};
