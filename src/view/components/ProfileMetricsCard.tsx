import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";
import { themes, type OrbityTheme } from "../theme/tokens";

export type ProfileMetricsCardProps = {
  readonly metrics: {
    readonly streakDays: number;
    readonly achievementsCount: number;
    readonly studyHours: number;
  } | null;
  readonly loading: boolean;
  readonly theme?: OrbityTheme;
};

export const ProfileMetricsCard = ({ metrics, loading, theme = themes.cosmic }: ProfileMetricsCardProps) => {
  const entries = metrics ? [
    { value: metrics.streakDays, label: "Dias de sequência", unit: metrics.streakDays === 1 ? "dia de sequência" : "dias de sequência" },
    { value: metrics.achievementsCount, label: "Conquistas adquiridas", unit: metrics.achievementsCount === 1 ? "conquista adquirida" : "conquistas adquiridas" },
    { value: metrics.studyHours, label: "Horas de estudos completos", unit: metrics.studyHours === 1 ? "hora de estudos completos" : "horas de estudos completos" },
  ] : [];
  const styles = createStyles(theme);

  if (loading) return (
    <View style={styles.card} accessible accessibilityLabel="Carregando métricas do perfil" accessibilityState={{ busy: true }}>
      <View style={styles.metricsRow} importantForAccessibility="no-hide-descendants" aria-hidden>
        {[0, 1, 2].map((index) => <Fragment key={index}>
          {index > 0 && <View style={styles.divider} accessible={false} />}
          <View style={styles.metric}>
            <View style={styles.valueSkeleton} />
            <View style={styles.labelSkeleton} />
          </View>
        </Fragment>)}
      </View>
    </View>
  );

  return <View style={styles.card}>
    {!metrics ? <Text style={styles.body}>Métricas indisponíveis no momento.</Text> : <>
      <View style={styles.metricsRow}>
        {entries.map(({ value, label, unit }, index) => <Fragment key={label}>
          {index > 0 && <View style={styles.divider} accessible={false} />}
          <View style={styles.metric} accessible accessibilityLabel={`${value.toLocaleString("pt-BR")} ${unit}`}>
            <Text allowFontScaling style={styles.value}>{value.toLocaleString("pt-BR")}</Text>
            <Text allowFontScaling style={styles.label}>{label}</Text>
          </View>
        </Fragment>)}
      </View>
      {entries.every(({ value }) => value === 0) && <Text style={styles.emptyMessage}>Sua jornada pode começar no seu ritmo. Cada momento de estudo conta.</Text>}
    </>}
  </View>;
};

const createStyles = (theme: OrbityTheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.color["surface-variant"],
    borderColor: theme.color.border,
    borderWidth: theme.divider.width,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    gap: theme.space.sm,
    elevation: theme.elevation.card,
  },
  metricsRow: { flexDirection: "row", alignItems: "stretch", gap: theme.space.sm },
  metric: { flex: 1, minWidth: 0, alignItems: "center", gap: theme.space.sm },
  valueSkeleton: { width: "60%", height: theme.font.title.lineHeight, backgroundColor: theme.color["action-subtle"], borderRadius: theme.radius.md },
  labelSkeleton: { width: "80%", height: theme.font.label.lineHeight, backgroundColor: theme.color["action-subtle"], borderRadius: theme.radius.md },
  body: { ...theme.font.body, color: theme.color["on-surface"] },
  emptyMessage: { ...theme.font.body, color: theme.color["on-surface"], marginTop: theme.space.md },
  divider: { width: theme.divider.width, alignSelf: "stretch", marginVertical: theme.space.sm, backgroundColor: theme.color.border },
  value: { ...theme.font.title, color: theme.color["on-action"], backgroundColor: theme.color.action, alignSelf: "center", maxWidth: "100%", flexShrink: 1, textAlign: "center", paddingHorizontal: theme.space.sm, borderRadius: theme.radius.md },
  label: { ...theme.font.label, color: theme.color["on-surface"], textAlign: "center", alignSelf: "stretch" },
});
