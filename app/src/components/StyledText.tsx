import { Text as ThemedText, TextProps } from "./Themed";
import Fonts, { Font } from "@/constants/Fonts";

interface Props extends TextProps {
  font?: Font;
}

const StyledText = ({ font, style, ...props }: Props) => <ThemedText style={[font && Fonts[font], style]} {...props} />;

export default StyledText;
