import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { type ComponentType, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { useReduceMotion } from "../theme/useReduceMotion";
import type { CosmicSkyProps } from "./CosmicSky";
import type { CosmicSkyCanvasProps } from "./CosmicSkyCanvas";

// Na web (só o Storybook), o Skia roda no CanvasKit, servido pelo próprio Storybook (staticDirs).
const loadCanvas = async (): Promise<{ default: ComponentType<CosmicSkyCanvasProps> }> => {
  const { CosmicSkyCanvas } = await import("./CosmicSkyCanvas");
  return { default: CosmicSkyCanvas };
};

export const CosmicSky = ({ glow = false }: CosmicSkyProps) => {
  const reduceMotion = useReduceMotion();
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setFrame((current) => (current.width === width && current.height === height ? current : { width, height }));
  };

  return (
    <View pointerEvents="none" aria-hidden style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {frame.width > 0 ? (
        <WithSkiaWeb<CosmicSkyCanvasProps>
          opts={{ locateFile: (file: string) => `/${file}` }}
          getComponent={loadCanvas}
          fallback={null}
          componentProps={{ width: frame.width, height: frame.height, animate: !reduceMotion, glow }}
        />
      ) : null}
    </View>
  );
};
