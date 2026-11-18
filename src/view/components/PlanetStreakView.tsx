import { StyleSheet, Text, View } from "react-native";
import { HOME_COPY, streakUnit } from "../homeCopy";
import { planetColors, themes } from "../theme/tokens";
import { PLANET_ARTBOARD, PLANET_SPHERE, PlanetIllustration } from "./PlanetIllustration";

const theme = themes.cosmic;

export type PlanetStreakViewProps = {
  /** Dias de sequência (RF-0015). */
  days: number;
  /** Lado da arte, em dp. Desenho e contador escalam juntos, como no protótipo. */
  size: number;
};

/** Planeta com o número da sequência como texto real (visualizacao-sequencia.md). */
export const PlanetStreakView = ({ days, size }: PlanetStreakViewProps) => {
  const label = `${days} ${streakUnit(days)}`;
  const offset = (size - PLANET_ARTBOARD) / 2;
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={days === 0 ? `${label}. ${HOME_COPY["streak.empty"]}` : label}
      style={{ width: size, height: size }}
    >
      <View style={[styles.artboard, { left: offset, top: offset, transform: [{ scale: size / PLANET_ARTBOARD }] }]}>
        <PlanetIllustration />
        <View pointerEvents="none" style={styles.sequence}>
          <Text allowFontScaling style={styles.count}>
            {days}
          </Text>
          <Text allowFontScaling style={styles.label}>
            {streakUnit(days)}
          </Text>
        </View>
      </View>
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
