import React from "react";
import { View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

export default function Logo() {
  return (
    <View style={{ alignSelf: "center" }}>
      <Svg width={128} height={128} fill="none">
        <Path
          fill="url(#a)"
          d="M2.833 60.703 32.777 8.41l10.112 5.66c7.23 4.046 9.775 13.21 5.667 20.406L30.757 65.651l-4.35 7.457-6.576 11.7-4.297-7.485 26.55-46.567a7.456 7.456 0 0 0-2.856-10.211l-3.81-2.117L8.698 65.651l11.003 19.387 15.094 26.594 25.516-28.23a4.971 4.971 0 0 1 7.376 0l25.516 28.23 15.103-26.61 4.267-7.518 5.337-9.403c.862-1.52.863-3.38.003-4.901L92.582 18.428 88.7 20.586a7.456 7.456 0 0 0-2.85 10.221l26.601 46.481-4.234 7.571-6.624-11.751-.087.15-8.01 13.856c-1.683 2.91-5.708 3.346-7.975.864l-19.684-21.56a2.486 2.486 0 0 0-3.672 0L42.48 87.979c-2.267 2.483-6.292 2.047-7.974-.864l-8.02-13.87 4.359-7.437 8.3 14.757L60.323 57.27a4.971 4.971 0 0 1 7.356 0l21.176 23.294 8.305-14.765.084-.148-17.8-31.206c-4.108-7.204-1.55-16.376 5.694-20.414l10.086-5.622 29.944 52.294a9.942 9.942 0 0 1-.007 9.892l-27.311 47.542c-1.68 2.925-5.725 3.363-7.992.864L65.841 92.534a2.485 2.485 0 0 0-3.682 0l-24.016 26.467c-2.267 2.499-6.311 2.061-7.992-.864l-19.015-33.1L2.84 70.595a9.942 9.942 0 0 1-.007-9.892Z"
        />
        <Path
          fill="url(#b)"
          d="m30.757 65.651-4.35 7.457.08.136 4.357-7.437-.087-.156Z"
        />
        <Path
          fill="url(#c)"
          d="m17.243 74.35-1.83 3.139 4.286 7.546 1.858-3.304-4.314-7.38Z"
        />
        <Path
          fill="url(#d)"
          d="m108.307 85.008 4.27-7.516-1.786-3.059-4.188 7.55 1.704 3.025Z"
        />
        <Defs>
          <LinearGradient
            id="a"
            x1={-0.621}
            x2={169.631}
            y1={65.651}
            y2={100.447}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0.005} stopColor="#D900C3" />
            <Stop offset={0.262} stopColor="#8900D9" />
            <Stop offset={0.462} stopColor="#4C42D1" />
            <Stop offset={0.773} stopColor="#1EAEF9" />
          </LinearGradient>
          <LinearGradient
            id="b"
            x1={-0.622}
            x2={169.631}
            y1={65.651}
            y2={100.447}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0.005} stopColor="#D900C3" />
            <Stop offset={0.262} stopColor="#8900D9" />
            <Stop offset={0.462} stopColor="#4C42D1" />
            <Stop offset={0.773} stopColor="#1EAEF9" />
          </LinearGradient>
          <LinearGradient
            id="c"
            x1={21.748}
            x2={15.534}
            y1={79.321}
            y2={83.049}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0.296} stopColor="#B201CE" stopOpacity={0.85} />
            <Stop offset={1} stopOpacity={0.7} />
          </LinearGradient>
          <LinearGradient
            id="d"
            x1={112.466}
            x2={103.762}
            y1={83.049}
            y2={78.086}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopOpacity={0.7} />
            <Stop offset={0.435} stopColor="#347CE7" />
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
}
