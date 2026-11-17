import { StyleSheet, View } from "react-native";
import { cosmicColors, themes } from "../theme/tokens";

const theme = themes.cosmic;

export type SkeletonCardsProps = {
  /** Quantidade de cards de espera. */
  count?: number;
  /** Texto anunciado pelo leitor de tela enquanto carrega (ex.: "Carregando suas rotinas…"). */
  accessibilityLabel: string;
};

/**
 * Esqueleto estrutural dos cards enquanto os dados carregam (05-padroes.md, F5 e F8). Usa os mesmos
 * tokens do esqueleto da Início (card cósmico, trilha e `radius.lg`) e é estático: não há movimento
 * para desligar com o movimento reduzido.
 */
export const SkeletonCards = ({ count = 3, accessibilityLabel }: SkeletonCardsProps) => (
  <View
    accessible
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ busy: true }}
    accessibilityLiveRegion="polite"
    style={styles.group}
  >
    {Array.from({ length: count }, (_, key) => (
      <View key={key} style={styles.card}>
        <View style={styles.title} />
        <View style={styles.body} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  group: { gap: theme.space.sm },
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    gap: theme.space.md,
    backgroundColor: cosmicColors.card,
  },
  title: { height: theme.space.md, width: "45%", borderRadius: theme.space.sm, backgroundColor: cosmicColors.track },
  body: { height: theme.space.sm, width: "80%", borderRadius: theme.primitive["space-4"], backgroundColor: cosmicColors.track },
});
