import { motionTokens } from "../theme/tokens";
import { useReduceMotion } from "../theme/useReduceMotion";
import { ProceduralPlanetCanvas } from "./ProceduralPlanetCanvas";

export type ProceduralPlanetProps = {
  size: number;
  showRing?: boolean;
  /** Força o planeta parado (stories e comparação); por padrão segue o movimento reduzido do sistema. */
  still?: boolean;
};

/**
 * Planeta procedural em shader (#221, prova de conceito). Decorativo: o contador da
 * sequência continua sendo texto real desenhado por cima, por quem usa o componente.
 */
export const ProceduralPlanet = ({ size, showRing = true, still = false }: ProceduralPlanetProps) => {
  const reduceMotion = useReduceMotion();
  return (
    <ProceduralPlanetCanvas
      size={size}
      rotationSeconds={motionTokens.planetRotation / 1000}
      animate={!still && !reduceMotion}
      showRing={showRing}
    />
  );
};
