import { useEffect, useId, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, Image, Mask, RadialGradient, Rect, Stop } from "react-native-svg";
import { cosmicColors } from "../theme/tokens";
import { useReduceMotion } from "../theme/use-reduce-motion";
import { PLANET_ARTBOARD, PLANET_SPHERE } from "./PlanetIllustration";

// Arte do planeta em imagem (experimento da branch feat/planeta-animado).
const ORBITY_SPACE = require("../../../assets/images/home/orbity-space.webp");

/** Medidas da imagem original, em pixels, e da esfera dentro dela (centro e raio medidos na arte). */
const SOURCE = { width: 1536, height: 1024, sphere: { cx: 762, cy: 512, r: 295 } } as const;

// A imagem é posicionada para que a esfera coincida com PLANET_SPHERE na grade de 280 × 280:
// assim o contador da sequência continua centrado no planeta, como no desenho vetorial.
const SCALE = PLANET_SPHERE.r / SOURCE.sphere.r;
/** Área desenhada além da grade de 280, para as bordas da imagem sumirem longe das pontas do anel. */
const BLEED = 60;
const CANVAS = PLANET_ARTBOARD + BLEED * 2;
const IMAGE_FRAME = {
  x: BLEED + PLANET_SPHERE.cx - SOURCE.sphere.cx * SCALE,
  y: BLEED + PLANET_SPHERE.cy - SOURCE.sphere.cy * SCALE,
  width: SOURCE.width * SCALE,
  height: SOURCE.height * SCALE,
} as const;
/** A máscara (clara = visível) mantém a arte inteira até as pontas do anel e esmaece o fundo da imagem até sumir. */
const FADE_START = (PLANET_SPHERE.r * 1.5) / (CANVAS / 2);

// Movimento proposto para o experimento; ainda não são tokens do ODS.
/** Deslocamento vertical máximo, na grade de 280 (escala junto com a arte). */
const FLOAT_DISTANCE = 10;
/** Duração de cada meia volta (subida ou descida). */
const FLOAT_HALF_MS = 2500;
/** Aumento máximo da "respiração" (1 → 1,015). */
const BREATH_SCALE = 0.015;

export type OrbityPlanetProps = {
  /** Conteúdo que flutua junto com a arte, como o contador da sequência. */
  children?: ReactNode;
};

/**
 * Planeta da Tela Inicial a partir da imagem original, com flutuação vertical e "respiração"
 * contínuas. Com movimento reduzido no sistema, fica parado.
 */
export const OrbityPlanet = ({ children }: OrbityPlanetProps) => {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(progress);
      progress.value = 0;
      return undefined;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: FLOAT_HALF_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  const floating = useAnimatedStyle(() => ({
    transform: [{ translateY: -FLOAT_DISTANCE * progress.value }, { scale: 1 + BREATH_SCALE * progress.value }],
  }));

  return (
    <Animated.View style={[styles.box, floating]}>
      <View style={styles.art} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
        <Svg width={CANVAS} height={CANVAS} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
          <Defs>
            <RadialGradient id={`${id}-fade`} cx="50%" cy="50%" r="50%">
              <Stop offset={FADE_START} stopColor={cosmicColors.text} stopOpacity={1} />
              <Stop offset={1} stopColor={cosmicColors.text} stopOpacity={0} />
            </RadialGradient>
            <Mask id={`${id}-mask`}>
              <Rect width={CANVAS} height={CANVAS} fill={`url(#${id}-fade)`} />
            </Mask>
          </Defs>
          <Image href={ORBITY_SPACE} {...IMAGE_FRAME} preserveAspectRatio="none" mask={`url(#${id}-mask)`} />
        </Svg>
      </View>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  box: { position: "absolute", width: PLANET_ARTBOARD, height: PLANET_ARTBOARD },
  art: { position: "absolute", left: -BLEED, top: -BLEED, width: CANVAS, height: CANVAS },
});
