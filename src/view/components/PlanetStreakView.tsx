import { StyleSheet, Text, View } from "react-native";
import { HOME_COPY, streakUnit } from "../home-copy";
import { cosmicColors, themes } from "../theme/tokens";
import { PLANET_ASPECT_RATIO, PlanetIllustration } from "./PlanetIllustration";

const theme = themes.cosmic;

export type PlanetStreakViewProps = {
  /** Dias de sequência (RF-0015). */
  days: number;
  /** Largura da arte; a altura segue a proporção do planeta. */
  size: number;
};

/** Planeta com o número da sequência como texto real (visualizacao-sequencia.md). */
export const PlanetStreakView = ({ days, size }: PlanetStreakViewProps) => {
  const label = `${days} ${streakUnit(days)}`;
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={days === 0 ? `${label}. ${HOME_COPY["streak.empty"]}` : label}
      style={[styles.container, { width: size, height: size * PLANET_ASPECT_RATIO }]}
    >
      <PlanetIllustration />
      <View pointerEvents="none" style={styles.sequence}>
        <Text allowFontScaling style={styles.count}>
          {days}
        </Text>
        <Text allowFontScaling style={styles.label}>
          {streakUnit(days)}
        </Text>
        {days === 0 ? (
          <Text allowFontScaling style={styles.empty}>
            {HOME_COPY["streak.empty"]}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

// A sombra escura em volta do texto garante leitura sobre as áreas claras do planeta.
const textHalo = {
  textShadowColor: cosmicColors.background,
  textShadowOffset: { width: 0, height: 0 },
} as const;

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  sequence: {
    position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.space.lg,
  },
  count: { ...theme.font.streak, ...textHalo, textShadowRadius: theme.space.md, color: theme.color["on-surface"], textAlign: "center" },
  label: { ...theme.font.body, ...textHalo, textShadowRadius: theme.space.sm, color: theme.color["on-surface"], textAlign: "center" },
  empty: {
    ...theme.font.caption,
    ...textHalo,
    textShadowRadius: theme.space.sm,
    color: theme.color["on-surface"],
    textAlign: "center",
    marginTop: theme.space.sm,
  },
});
