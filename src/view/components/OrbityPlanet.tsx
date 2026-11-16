import { useEffect, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useReduceMotion } from "../theme/use-reduce-motion";
import { PLANET_ARTBOARD } from "./PlanetIllustration";
import { SkiaPlanet } from "./SkiaPlanet";

// Movimento proposto para o experimento (feat/planeta-animado); ainda não são tokens do ODS.
/** Deslocamento vertical máximo, na grade de 280 (escala junto com a arte). */
const FLOAT_DISTANCE = 10;
/** Duração de cada meia volta (subida ou descida). */
const FLOAT_HALF_MS = 2500;
/** Aumento máximo da "respiração" (1 → 1,015). */
const BREATH_SCALE = 0.015;

export type OrbityPlanetProps = {
  /** Lado da arte, em dp. */
  size: number;
  /** Conteúdo que flutua junto com o planeta, como o contador da sequência. */
  children?: ReactNode;
};

/**
 * Planeta da Tela Inicial desenhado em camadas no Skia (anel, lua, brilho e estrelas animados),
 * com flutuação vertical e "respiração" do conjunto. Com movimento reduzido no sistema, fica parado.
 */
export const OrbityPlanet = ({ size, children }: OrbityPlanetProps) => {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);
  const distance = (FLOAT_DISTANCE * size) / PLANET_ARTBOARD;

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
    transform: [{ translateY: -distance * progress.value }, { scale: 1 + BREATH_SCALE * progress.value }],
  }));

  return (
    <Animated.View style={[styles.fill, floating]}>
      <View style={styles.fill} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
        <SkiaPlanet size={size} animate={!reduceMotion} />
      </View>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
});
