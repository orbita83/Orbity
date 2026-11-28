import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { TaskDetailsActions, TaskDetailsState } from "../viewmodel/useTaskDetailsViewModel";
import { CategoryTag } from "./components/CategoryTag";
import { GradientSurface } from "./components/GradientSurface";
import { MaterialSymbol } from "./components/MaterialSymbol";
import { PrimaryButton } from "./components/PrimaryButton";
import { ScreenHeader } from "./components/ScreenHeader";
import { resolveCategoryDisplay } from "./categoryCopy";
import { TASKS_COPY } from "./tasksCopy";
import { cosmicBorders, cosmicColors, cosmicGradients, themes } from "./theme/tokens";

const theme = themes.cosmic;

export type TaskDetailsScreenContentProps = TaskDetailsState &
  Pick<TaskDetailsActions, "toggleCompleted"> & {
    onBack: () => void;
    onEdit: () => void;
  };

/** Detalhe da tarefa (protótipo 2.4, ODS 1.3), só de apresentação. */
export const TaskDetailsScreenContent = ({
  task,
  categories,
  loading,
  errorKey,
  toggleCompleted,
  onBack,
  onEdit,
}: TaskDetailsScreenContentProps) => {
  const insets = useSafeAreaInsets();

  if (!task) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title={TASKS_COPY["details.title"]} backLabel={TASKS_COPY["details.back"]} onBack={onBack} />
        {loading ? null : (
          <View accessible accessibilityRole="alert" style={styles.missing}>
            <Text allowFontScaling style={styles.cardTitle}>
              {TASKS_COPY["details.missing.title"]}
            </Text>
            <Text allowFontScaling style={[styles.muted, styles.centered]}>
              {TASKS_COPY["details.missing.message"]}
            </Text>
          </View>
        )}
      </View>
    );
  }

  const category = task.category ? resolveCategoryDisplay(task.category, categories) : undefined;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={TASKS_COPY["details.title"]} backLabel={TASKS_COPY["details.back"]} onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryText}>
              <Text accessibilityRole="header" allowFontScaling style={[styles.cardTitle, task.completed && styles.done]}>
                {task.title}
              </Text>
              {task.description ? (
                <Text allowFontScaling style={styles.muted}>
                  {task.description}
                </Text>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={TASKS_COPY["details.edit"]}
              onPress={onEdit}
              style={({ pressed }) => [styles.edit, pressed && styles.pressed]}
            >
              <MaterialSymbol name="edit" color={theme.color["on-surface"]} size={theme.space.md} />
              <Text allowFontScaling style={styles.editLabel}>
                {TASKS_COPY["details.edit"]}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" allowFontScaling style={styles.sectionTitle}>
            {TASKS_COPY["details.when"]}
          </Text>
          <InfoRow icon="schedule" label={TASKS_COPY["details.start"]} value={task.startLabel ?? TASKS_COPY["details.none"]} />
          <InfoRow icon="calendar_today" label={TASKS_COPY["details.end"]} value={task.endLabel ?? TASKS_COPY["details.none"]} />
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" allowFontScaling style={styles.sectionTitle}>
            {TASKS_COPY["details.category"]}
          </Text>
          {category ? (
            <View style={styles.tagRow}>
              <CategoryTag label={category.label} symbol={category.symbol} theme={theme} />
            </View>
          ) : (
            <Text allowFontScaling style={styles.muted}>
              {TASKS_COPY["form.category.empty"]}
            </Text>
          )}
        </View>

        {errorKey ? (
          <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.alert}>
            <MaterialSymbol name="error" filled color={theme.color.error} size={theme.navbar.iconSize} />
            <Text allowFontScaling style={styles.alertText}>
              {TASKS_COPY[errorKey]}
            </Text>
          </View>
        ) : null}

        {/* Sem "Excluir" aqui (ODS 1.3): a exclusão fica no "•••" e no toque longo da lista. */}
        <View style={styles.note}>
          <MaterialSymbol name="info" color={cosmicColors.focus} size={theme.navbar.iconSize} />
          <Text allowFontScaling style={styles.noteText}>
            {TASKS_COPY["details.deleteHint"]}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space.md }]}>
        <PrimaryButton
          theme={theme}
          label={task.completed ? TASKS_COPY["details.reopen"] : TASKS_COPY["details.complete"]}
          icon={<MaterialSymbol name={task.completed ? "undo" : "check"} color={theme.button.label} size={theme.navbar.iconSize} />}
          onPress={toggleCompleted}
        />
      </View>
    </View>
  );
};

const InfoRow = ({ icon, label, value }: { icon: "schedule" | "calendar_today"; label: string; value: string }) => (
  <View accessible accessibilityLabel={`${label}: ${value}`} style={styles.infoRow}>
    <MaterialSymbol name={icon} color={theme.color["on-surface-variant"]} size={theme.navbar.iconSize} />
    <View style={styles.infoText}>
      <Text allowFontScaling style={styles.muted}>
        {label}
      </Text>
      <Text allowFontScaling style={styles.infoValue}>
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface },
  scroll: { flex: 1 },
  content: { gap: theme.space.lg, paddingHorizontal: theme.space.md, paddingTop: theme.space.sm, paddingBottom: theme.space.lg },
  muted: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
  centered: { textAlign: "center" },
  done: { textDecorationLine: "line-through" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: theme.primitive["space-4"], padding: theme.space.lg },
  summary: {
    padding: theme.space.md,
    borderRadius: theme.radius.lg,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.card,
    backgroundColor: cosmicColors.card,
    overflow: "hidden",
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: theme.space.md },
  summaryText: { flex: 1, minWidth: 0, gap: theme.primitive["space-4"] },
  cardTitle: { ...theme.font["card-title"], color: theme.color["on-surface"] },
  edit: {
    minHeight: theme.target.minSize,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-control"],
    backgroundColor: theme.color["action-subtle"],
  },
  editLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  pressed: { opacity: theme.motion.opacityPressed },
  section: { gap: theme.space.sm },
  sectionTitle: { ...theme.font["card-title"], color: theme.color["on-surface"] },
  infoRow: { flexDirection: "row", alignItems: "center", gap: theme.space.md, minHeight: theme.target.minSize },
  infoText: { flex: 1, minWidth: 0 },
  infoValue: { ...theme.font.body, color: theme.color["on-surface"] },
  tagRow: { flexDirection: "row" },
  alert: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  alertText: { ...theme.font.body, color: theme.color["on-surface"], flex: 1 },
  note: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  noteText: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"], flex: 1 },
  footer: {
    paddingTop: theme.space.md,
    paddingHorizontal: theme.space.md,
    backgroundColor: theme.navbar.bg,
    borderTopWidth: theme.border.widthThin,
    borderTopColor: theme.color["border-subtle"],
    boxShadow: theme.shadow.bar,
  },
});
