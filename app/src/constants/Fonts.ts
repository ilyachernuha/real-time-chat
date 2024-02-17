import { TextStyle } from "react-native";

type Fonts = {
  [font: string]: TextStyle;
};

export default {
  regular14: {
    fontFamily: "e-Ukraine Regular",
    fontSize: 14,
    lineHeight: 1.3 * 14,
    letterSpacing: 0.015 * 14,
  },
  regular12: {
    fontFamily: "e-Ukraine Head Regular",
    fontSize: 12,
    lineHeight: 1.2 * 12,
    letterSpacing: 0.5,
  },
  regular10: {
    fontFamily: "e-Ukraine Head Regular",
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.5,
  },
  bold: {
    fontFamily: "e-Ukraine Head Bold",
    fontSize: 18,
    lineHeight: 1.2 * 18,
    letterSpacing: 1.5,
  },
  light: {
    fontFamily: "e-Ukraine Head Light",
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1,
  },
} as Fonts;
