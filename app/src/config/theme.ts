import { TextStyle } from "react-native";

export const colors = {
  main: {
    black: "#121212",
    dark_grey: "#1F1F1F",
    blue: "#4C42D1",
    error_red: "#FF453A",
  },
  secondary: {
    light_grey: "#4D4D4D",
    blue: "#3325E7",
  },
  text: {
    white: "#E3E3E3",
  },
};

interface Fonts {
  [font: string]: TextStyle;
}

export const fonts: Fonts = {
  bold: { fontFamily: "e-Ukraine Head Bold", fontSize: 18, letterSpacing: 1.5 },
  regular_14: {
    fontFamily: "e-Ukraine Regular",
    fontSize: 14,
    letterSpacing: 0.015 * 14,
  },
  regular_12: {
    fontFamily: "e-Ukraine Head Regular",
    fontSize: 12,
    letterSpacing: 1,
  },
  regular_10: {
    fontFamily: "e-Ukraine Head Regular",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  light: {
    fontFamily: "e-Ukraine Head Light",
    fontSize: 10,
    letterSpacing: 1,
  },
};
