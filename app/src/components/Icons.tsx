import { createIconSet } from "@expo/vector-icons";
import { OpaqueColorValue, TextProps, View } from "react-native";

export const glyphMap = {
  "visibility": "visibility",
  "visibility-off": "visibility_off",
  "email": "alternate_email",
  "arrow-back": "arrow_back_ios_new",
  "browse": "browse",
  "chats": "forum",
  "notification": "notifications_active",
  "person": "person",
  "search": "search",
  "filter": "filter_list",
  "add": "add_circle",
  "notifications-off": "notifications_off",
  "image": "imagesmode",
  "drop-down": "arrow_drop_down",
  "drop-up": "arrow_drop_up",
  "message-read": "done_all",
  "mic": "mic",
  "send": "send",
  "attach": "attach_file",
  "done": "done",
  "qr-code": "qr_code",
  "leave": "logout",
  "dots": "more_horiz",
  "copy": "content_copy",
  "link": "link",
  "info": "info",
  "close": "close",
  "location": "my_location",
  "block": "block",
  "delete": "delete",
  "notifications": "notifications",
  "radio-button": "radio_button_unchecked",
  "radio-button-checked": "radio_button_checked",
  "check-box-checked": "check_box_outline_blank",
  "check-box": "check_box",
};

const IconSet = createIconSet(glyphMap, "icons", "icons.ttf");

interface IconProps extends TextProps {
  size?: number;
  name: keyof typeof glyphMap;
  color?: string | OpaqueColorValue;
}

const Icons = ({ size = 24, style, ...props }: IconProps) => {
  return (
    <View style={style}>
      <IconSet size={size} style={[{ lineHeight: size * 1.1, width: size, height: size }]} {...props} />
    </View>
  );
};

export default Icons;
