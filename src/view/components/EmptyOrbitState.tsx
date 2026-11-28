import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { cosmicBorders, cosmicColors, themes } from "../theme/tokens";

const theme = themes.cosmic;

/** Lado da ilustração do estado vazio (protótipo 2 e 3 vazias, 120 dp). */
const ILLUSTRATION = 120;

export type EmptyOrbitStateProps = {
  title: string;
  message: string;
};

/**
 * Estado vazio das listas com um planeta ao fundo (ODS 1.3, protótipo 2 e 3 vazias).
 * O planeta é decorativo e sem brilho; título e mensagem são anunciados como status.
 */
export const EmptyOrbitState = ({ title, message }: EmptyOrbitStateProps) => (
  <View accessible accessibilityRole="text" accessibilityLiveRegion="polite" accessibilityLabel={`${title}. ${message}`} style={styles.container}>
    <Svg width={ILLUSTRATION} height={ILLUSTRATION} viewBox="0 0 120 120" accessible={false}>
      {/* Metade de trás do anel, mais apagada. */}
      <G transform="rotate(-16 60 62)">
        <Path d="M6 62A54 15 0 0 1 114 62" fill="none" stroke={cosmicColors.inactive} strokeWidth={3} opacity={0.4} />
      </G>
      <Circle cx={60} cy={60} r={34} fill={theme.color["action-subtle"]} stroke={cosmicBorders.sheet} strokeWidth={2} />
      <Path d="M38 50c6-4 14-5 20-2M62 76c8 1 16-2 20-7" fill="none" stroke={cosmicBorders.sheet} strokeWidth={2} strokeLinecap="round" />
      <G transform="rotate(-16 60 62)">
        <Path d="M6 62A54 15 0 0 0 114 62" fill="none" stroke={cosmicColors.inactive} strokeWidth={3} strokeLinecap="round" />
      </G>
      <Path d="M98 18l1.5 3.5L103 23l-3.5 1.5L98 28l-1.5-3.5L93 23l3.5-1.5z" fill={cosmicColors.iconAccent} />
      <Circle cx={20} cy={30} r={2} fill={cosmicColors.muted} />
      <Circle cx={104} cy={96} r={1.5} fill={cosmicColors.muted} />
    </Svg>
    <View style={styles.texts}>
      <Text allowFontScaling style={styles.title}>
        {title}
      </Text>
      <Text allowFontScaling style={styles.message}>
        {message}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: theme.space.md,
    paddingVertical: theme.primitive["space-32"],
  },
  // Até 280 dp de largura, como no protótipo.
  texts: { maxWidth: ILLUSTRATION * 2 + theme.primitive["space-32"] + theme.space.sm, gap: theme.primitive["space-4"] },
  title: { ...theme.font["card-title"], color: theme.color["on-surface"], textAlign: "center" },
  message: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"], textAlign: "center" },
});
