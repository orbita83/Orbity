import { Canvas, Fill, Shader, Skia, useClock } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { useDerivedValue } from "react-native-reanimated";
import { PROCEDURAL_PLANET_SKSL, proceduralPlanetPalette } from "../proceduralPlanetShader";

export type ProceduralPlanetCanvasProps = {
  /** Lado do quadro, em dp. O planeta ocupa 62% do raio do quadro; o anel, o resto. */
  size: number;
  /** Duração de uma volta completa, em segundos (`motion.planet.rotation`). */
  rotationSeconds: number;
  /** Com movimento reduzido, o planeta fica parado num instante fixo. */
  animate: boolean;
  showRing?: boolean;
};

// Compilado uma vez: no Android pelo Skia nativo, na web pelo CanvasKit já carregado.
const effect = Skia.RuntimeEffect.Make(PROCEDURAL_PLANET_SKSL);

/** Instante usado quando a animação está desligada (fase com boa leitura do contador). */
const STILL_SECONDS = 6;

export const ProceduralPlanetCanvas = ({ size, rotationSeconds, animate, showRing = true }: ProceduralPlanetCanvasProps) => {
  const clock = useClock();
  const base = useMemo(
    () => ({ size: [size, size], rotationSeconds, showRing: showRing ? 1 : 0, ...proceduralPlanetPalette }),
    [size, rotationSeconds, showRing],
  );
  const uniforms = useDerivedValue(
    () => ({ ...base, t: animate ? clock.value / 1000 : STILL_SECONDS }),
    [base, animate],
  );

  if (!effect) return null;
  return (
    <Canvas style={{ width: size, height: size }} accessible={false}>
      <Fill>
        <Shader source={effect} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};
