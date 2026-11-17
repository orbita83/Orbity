import { StyleSheet, Text, View } from "react-native";
import { GradientSurface } from "./GradientSurface";
import { MaterialSymbol, type MaterialSymbolName } from "./material-symbol";
import { cosmicBorders, cosmicColors, cosmicGradients, themes, type OrbityTheme } from "../theme/tokens";

export type ProfileMetricsCardProps = {
  readonly metrics: {
    readonly streakDays: number;
    readonly achievementsCount: number;
    readonly studyHours: number;
  } | null;
  readonly loading: boolean;
  readonly theme?: OrbityTheme;
};

type MetricDefinition = {
  readonly icon: MaterialSymbolName;
  readonly one: string;
  readonly other: string;
};

// Rótulos do protótipo (tela 5): a unidade acompanha o número, no singular ou no plural.
const METRICS: readonly MetricDefinition[] = [
  { icon: "local_fire_department", one: "dia de sequência", other: "dias de sequência" },
  { icon: "emoji_events", one: "conquista", other: "conquistas" },
  { icon: "schedule", one: "hora de estudo", other: "horas de estudo" },
];

const EMPTY_MESSAGE = "Sua jornada pode começar no seu ritmo. Cada momento de estudo conta.";

/** Seção "Sua jornada" do Perfil: três quadros de métrica e a mensagem acolhedora quando tudo é zero. */
export const ProfileMetricsCard = ({ metrics, loading, theme = themes.cosmic }: ProfileMetricsCardProps) => {
  const styles = createStyles(theme);

  if (loading) {
    return (
      <View
        style={styles.section}
        accessible
        accessibilityLabel="Carregando métricas do perfil"
        accessibilityState={{ busy: true }}
      >
        <View style={styles.titleSkeleton} />
        <View style={styles.grid} importantForAccessibility="no-hide-descendants" aria-hidden>
          {METRICS.map((metric) => (
            <View key={metric.other} style={styles.tile}>
              <View style={styles.iconSkeleton} />
              <View style={styles.valueSkeleton} />
              <View style={styles.labelSkeleton} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  const values = metrics ? [metrics.streakDays, metrics.achievementsCount, metrics.studyHours] : [];

  return (
    <View style={styles.section}>
      <Text allowFontScaling accessibilityRole="header" style={styles.title}>
        Sua jornada
      </Text>
      {metrics ? (
        <>
          <View style={styles.grid}>
            {METRICS.map((metric, index) => {
              const value = values[index];
              const unit = value === 1 ? metric.one : metric.other;
              const formatted = value.toLocaleString("pt-BR");
              return (
                <View key={metric.other} style={styles.tile} accessible accessibilityLabel={`${formatted} ${unit}`}>
                  <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
                  <MaterialSymbol name={metric.icon} filled color={theme.color.focus} size={theme.navbar.iconSize} />
                  <Text allowFontScaling numberOfLines={1} adjustsFontSizeToFit style={styles.value}>
                    {formatted}
                  </Text>
                  <Text allowFontScaling style={styles.label}>
                    {unit}
                  </Text>
                </View>
              );
            })}
          </View>
          {values.every((value) => value === 0) ? (
            <Text allowFontScaling style={styles.emptyMessage}>
              {EMPTY_MESSAGE}
            </Text>
          ) : null}
        </>
      ) : (
        <Text allowFontScaling style={styles.emptyMessage}>
          Métricas indisponíveis no momento.
        </Text>
      )}
    </View>
  );
};

const createStyles = (theme: OrbityTheme) =>
  StyleSheet.create({
    section: { gap: theme.space.sm },
    title: { ...theme.font["card-title"], color: theme.color["on-surface"] },
    grid: { flexDirection: "row", gap: theme.space.sm },
    tile: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      gap: theme.primitive["space-4"],
      paddingVertical: theme.space.md,
      paddingHorizontal: theme.space.sm,
      borderRadius: theme.radius.lg,
      borderWidth: theme.border.widthThin,
      borderColor: cosmicBorders.card,
      backgroundColor: cosmicColors.card,
      overflow: "hidden",
    },
    iconSkeleton: {
      width: theme.navbar.iconSize,
      height: theme.navbar.iconSize,
      borderRadius: theme.radius.md,
      backgroundColor: theme.color["action-subtle"],
    },
    valueSkeleton: {
      width: "50%",
      height: theme.font.title.lineHeight,
      borderRadius: theme.radius.md,
      backgroundColor: theme.color["action-subtle"],
    },
    labelSkeleton: {
      width: "80%",
      height: theme.font["body-sm"].lineHeight,
      borderRadius: theme.radius.md,
      backgroundColor: theme.color["action-subtle"],
    },
    titleSkeleton: {
      width: "40%",
      height: theme.font["card-title"].lineHeight,
      borderRadius: theme.radius.md,
      backgroundColor: theme.color["action-subtle"],
    },
    value: { ...theme.font.title, color: theme.color["on-surface"], textAlign: "center" },
    label: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"], textAlign: "center" },
    emptyMessage: {
      ...theme.font["body-sm"],
      color: theme.color["on-surface"],
      paddingVertical: theme.space.sm,
      paddingHorizontal: theme.space.md,
      borderRadius: theme.radius.md,
      borderWidth: theme.border.widthThin,
      borderColor: cosmicBorders.sheet,
      backgroundColor: cosmicColors.sheet,
      overflow: "hidden",
    },
  });
