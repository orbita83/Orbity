import { Pressable, StyleSheet, Text, View } from "react-native";
import { cosmicTokens as t } from "../theme/tokens";
import { PlanetIllustration } from "./planet-illustration";

export type PlanetStreakViewProps = {
  streakDays: number;
  size?: number;
  stageDescription?: string;
  isFocusMode?: boolean;
  onPress?: () => void;
};

export const PlanetStreakView = ({
  streakDays,
  size = t.layout.maxWidth,
  stageDescription,
  isFocusMode = false,
  onPress,
}: PlanetStreakViewProps) => {
  const artworkStyle = { width: size, height: size * t.planet.aspectRatio };
  const content = (
    <>
      <PlanetIllustration isFocusMode={isFocusMode} />
      <View pointerEvents="none" style={styles.sequence}>
        <Text allowFontScaling style={styles.count}>{streakDays}</Text>
        <Text allowFontScaling style={styles.label}>dias de sequência</Text>
        {isFocusMode ? <Text allowFontScaling style={styles.focusLabel}>Em foco</Text> : null}
      </View>
    </>
  );
  const label = `${streakDays} dias de sequência. ${stageDescription ?? "Seu universo de estudos"}${isFocusMode ? ". Modo foco em andamento" : ""}`;

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Abre seu painel de foco e progresso"
      onPress={onPress}
      style={[styles.container, artworkStyle]}
    >
      {content}
    </Pressable>
  ) : (
    <View accessible accessibilityLabel={label} style={[styles.container, artworkStyle]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  sequence: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center", paddingHorizontal: t.space.lg },
  count: { ...t.font.streak, color: t.color.text, textAlign: "center", textShadowColor: t.color.background, textShadowRadius: 16, textShadowOffset: { width: 0, height: 2 } },
  label: { ...t.font.streakLabel, color: t.color.text, textAlign: "center", textShadowColor: t.color.background, textShadowRadius: 8, textShadowOffset: { width: 0, height: 1 } },
  focusLabel: { ...t.font.caption, color: t.color.focus, marginTop: t.space.xs },
});
