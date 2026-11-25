import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import type { PlanetFocusStage } from "../../viewmodel/useFocusSessionViewModel";
import { HOME_COPY, formatCopy, streakUnit } from "../homeCopy";
import { planetColors, themes } from "../theme/tokens";
import { PLANET_ARTBOARD, PLANET_SPHERE, PlanetIllustration } from "./PlanetIllustration";

const theme = themes.cosmic;
const FOCUS_PULSE_DURATION = theme.motion.durationMedium * 4;
const FOCUS_PULSE_SCALE = 1.03;

export type PlanetStreakViewProps = {
  /** Dias de sequência (RF-0015). */
  days: number;
  /** Lado da arte, em dp. Desenho e contador escalam juntos, como no protótipo. */
  size: number;
  /** Indica se o Modo Foco está ativo para habilitar os efeitos visuais de RN-0006. */
  focusActive?: boolean;
  /** Estágio progressivo de evolução durante a sessão (0 = inativo, 1..4 = evolução no ciclo). */
  focusStage?: PlanetFocusStage;
  /** Desliga a pulsação orbital quando a preferência de redução de movimento estiver ativa. */
  reduceMotion?: boolean;
};

/** Planeta com o número da sequência como texto real (visualizacao-sequencia.md e RN-0006). */
export const PlanetStreakView = ({
  days,
  size,
  focusActive = false,
  focusStage = 0,
  reduceMotion = false,
}: PlanetStreakViewProps) => {
  const [pulse] = useState(() => new Animated.Value(1));
  const activeStage: PlanetFocusStage = focusActive ? focusStage : 0;

  useEffect(() => {
    if (!focusActive || activeStage === 0 || reduceMotion) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: FOCUS_PULSE_SCALE,
          duration: FOCUS_PULSE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: FOCUS_PULSE_DURATION,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
      pulse.setValue(1);
    };
  }, [activeStage, focusActive, pulse, reduceMotion]);

  const baseLabel = `${days} ${streakUnit(days)}`;
  const streakLabel = days === 0 ? `${baseLabel}. ${HOME_COPY["streak.empty"]}` : baseLabel;
  const accessibilityLabel =
    focusActive && activeStage > 0
      ? `${streakLabel} ${formatCopy("streak.focusActive", { stage: activeStage })}`
      : streakLabel;
  const offset = (size - PLANET_ARTBOARD) / 2;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      style={{ width: size, height: size }}
    >
      <Animated.View
        style={[
          styles.artboard,
          {
            left: offset,
            top: offset,
            transform: [{ scale: size / PLANET_ARTBOARD }, { scale: pulse }],
          },
        ]}
      >
        <PlanetIllustration focusActive={focusActive} focusStage={activeStage} />
        <View pointerEvents="none" style={styles.sequence}>
          <Text allowFontScaling style={styles.count}>
            {days}
          </Text>
          <Text allowFontScaling style={styles.label}>
            {streakUnit(days)}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// A sombra escura em volta do texto garante leitura sobre as áreas claras do planeta.
const textHalo = { textShadowColor: planetColors.night, textShadowOffset: { width: 0, height: 2 } } as const;
const sphereSide = PLANET_SPHERE.r * 2;

const styles = StyleSheet.create({
  artboard: { position: "absolute", width: PLANET_ARTBOARD, height: PLANET_ARTBOARD },
  sequence: {
    position: "absolute",
    left: PLANET_SPHERE.cx - PLANET_SPHERE.r,
    top: PLANET_SPHERE.cy - PLANET_SPHERE.r,
    width: sphereSide,
    height: sphereSide,
    alignItems: "center",
    justifyContent: "center",
  },
  count: { ...theme.font.streak, ...textHalo, textShadowRadius: theme.space.md, color: theme.color["on-surface"], textAlign: "center" },
  label: { ...theme.font.label, ...textHalo, textShadowRadius: theme.space.sm, color: theme.color["on-surface"], textAlign: "center" },
});
