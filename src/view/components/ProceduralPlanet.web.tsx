import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import type { ComponentType } from "react";
import { View } from "react-native";
import { motionTokens } from "../theme/tokens";
import { useReduceMotion } from "../theme/useReduceMotion";
import type { ProceduralPlanetProps } from "./ProceduralPlanet";
import type { ProceduralPlanetCanvasProps } from "./ProceduralPlanetCanvas";

// Na web (só o Storybook), o Skia roda no CanvasKit (WebAssembly). O canvaskit.wasm é servido
// pelo próprio Storybook (staticDirs em .storybook/main.ts), sem depender de CDN.
const loadCanvas = async (): Promise<{ default: ComponentType<ProceduralPlanetCanvasProps> }> => {
  const { ProceduralPlanetCanvas } = await import("./ProceduralPlanetCanvas");
  return { default: ProceduralPlanetCanvas };
};

export const ProceduralPlanet = ({ size, showRing = true, still = false }: ProceduralPlanetProps) => {
  const reduceMotion = useReduceMotion();
  return (
    <WithSkiaWeb<ProceduralPlanetCanvasProps>
      opts={{ locateFile: (file: string) => `/${file}` }}
      getComponent={loadCanvas}
      fallback={<View style={{ width: size, height: size }} />}
      componentProps={{ size, rotationSeconds: motionTokens.planetRotation / 1000, animate: !still && !reduceMotion, showRing }}
    />
  );
};
