import { Canvas, Fill, Shader, Skia, useClock } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { useDerivedValue } from "react-native-reanimated";
import { COSMIC_SKY_SKSL, cosmicSkyUniforms } from "../cosmicSkyShader";

export type CosmicSkyCanvasProps = {
  width: number;
  height: number;
  /** Com movimento reduzido, as estrelas param e a estrela cadente não aparece. */
  animate: boolean;
  /** Brilho de fundo da Tela Inicial. */
  glow: boolean;
};

const effect = Skia.RuntimeEffect.Make(COSMIC_SKY_SKSL);

/** Instante usado quando o movimento está desligado. */
const STILL_SECONDS = 2;

export const CosmicSkyCanvas = ({ width, height, animate, glow }: CosmicSkyCanvasProps) => {
  const clock = useClock();
  const base = useMemo(() => ({ ...cosmicSkyUniforms, size: [width, height], glow: glow ? 1 : 0 }), [width, height, glow]);
  const uniforms = useDerivedValue(
    () => ({ ...base, t: animate ? clock.value / 1000 : STILL_SECONDS, shooting: animate ? 1 : 0 }),
    [base, animate],
  );

  if (!effect) return null;
  return (
    <Canvas style={{ width, height }} accessible={false}>
      <Fill>
        <Shader source={effect} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};
