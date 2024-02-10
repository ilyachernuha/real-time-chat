import { Text, TextProps } from "./Themed";
import Fonts from "@/constants/Fonts";

export function RegularText(props: TextProps) {
  return (
    <Text
      {...props}
      style={[props.style, { fontFamily: "e-Ukraine Regular" }]}
    />
  );
}

export function Regular14(props: TextProps) {
  return <Text {...props} style={[props.style, Fonts.regular14]} />;
}

export function Regular12(props: TextProps) {
  return <Text {...props} style={[props.style, Fonts.regular12]} />;
}

export function Regular10(props: TextProps) {
  return <Text {...props} style={[props.style, Fonts.regular10]} />;
}

export function Light(props: TextProps) {
  return <Text {...props} style={[props.style, Fonts.light]} />;
}

export function Bold(props: TextProps) {
  return <Text {...props} style={[props.style, Fonts.bold]} />;
}
