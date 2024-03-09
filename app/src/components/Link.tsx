import { Link as DefaultLink, LinkProps } from "expo-router";
import { Pressable } from "react-native";
import Colors from "@/constants/Colors";
import StyledText from "./StyledText";

const Link = <T,>({ children, ...props }: LinkProps<T>) => (
  <DefaultLink asChild {...props}>
    <Pressable>
      {({ pressed }) => (
        <StyledText font="12" style={{ color: pressed ? Colors.dark.secondaryBlue : Colors.dark.mainPurple }}>
          {children}
        </StyledText>
      )}
    </Pressable>
  </DefaultLink>
);

export default Link;
