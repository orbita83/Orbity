import { useId, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

type GradientSurfaceProps = {
  from: string;
  to: string;
  horizontal?: boolean;
  testID?: string;
};

type Size = { width: number; height: number };

export const GradientSurface = ({ from, to, horizontal = false, testID }: GradientSurfaceProps) => {
  const gradientId = useId().replace(/:/g, "");
  const [size, setSize] = useState<Size | null>(null);

  // A Svg com width/height em porcentagem pode manter a primeira medição quando a View muda de
  // tamanho (ex.: barra de progresso de 67% para 100%). Medimos com onLayout e passamos números.
  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;
    setSize((current) => (current && current.width === width && current.height === height ? current : { width, height }));
  };

  return (
    // A cor de fundo é a de início do gradiente: a área nunca fica sem cor antes da medição.
    <View testID={testID} pointerEvents="none" accessible={false} onLayout={handleLayout} style={[StyleSheet.absoluteFill, { backgroundColor: from }]}>
      {size && size.width > 0 && size.height > 0 ? (
        <Svg testID={testID ? `${testID}-svg` : undefined} width={size.width} height={size.height}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2={horizontal ? "100%" : "0"} y2={horizontal ? "0" : "100%"}>
              <Stop offset="0" stopColor={from} />
              <Stop offset="1" stopColor={to} />
            </LinearGradient>
          </Defs>
          <Rect width={size.width} height={size.height} fill={`url(#${gradientId})`} />
        </Svg>
      ) : null}
    </View>
  );
};
