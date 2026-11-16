import type { ComponentType } from "react";
import { View } from "react-native";
import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import type { SkiaPlanetCanvasProps } from "./SkiaPlanetCanvas";

// Na web, o Skia roda no CanvasKit (WebAssembly), carregado antes do desenho.
// Experimento: o arquivo .wasm vem do CDN, na versão que o Skia instalado usa.
const CANVASKIT_VERSION = "0.41.0";

const loadCanvas = async (): Promise<{ default: ComponentType<SkiaPlanetCanvasProps> }> => {
  const { SkiaPlanetCanvas } = await import("./SkiaPlanetCanvas");
  return { default: SkiaPlanetCanvas };
};

export const SkiaPlanet = ({ size, animate }: SkiaPlanetCanvasProps) => (
  <WithSkiaWeb<SkiaPlanetCanvasProps>
    opts={{ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${CANVASKIT_VERSION}/bin/full/${file}` }}
    getComponent={loadCanvas}
    fallback={<View style={{ width: size, height: size }} />}
    componentProps={{ size, animate }}
  />
);
