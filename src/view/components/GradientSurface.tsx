import { useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

type GradientSurfaceProps = {
  from: string;
  to: string;
  horizontal?: boolean;
};

export const GradientSurface = ({ from, to, horizontal = false }: GradientSurfaceProps) => {
  const gradientId = useId().replace(/:/g, "");

  return (
    <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2={horizontal ? "100%" : "0"} y2={horizontal ? "0" : "100%"}>
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
};
