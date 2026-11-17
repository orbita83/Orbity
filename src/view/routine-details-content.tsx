import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RoutineDetailsActions, RoutineDetailsState } from "../viewmodel/useRoutineDetailsViewModel";
import { CheckCircle } from "./components/CheckCircle";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { GradientSurface } from "./components/GradientSurface";
import { IconTile } from "./components/IconTile";
import { MaterialSymbol, type MaterialSymbolName } from "./components/MaterialSymbol";
import { PrimaryButton } from "./components/PrimaryButton";
import { ScreenHeader } from "./components/ScreenHeader";
import { SkeletonCards } from "./components/SkeletonCards";
import { ROUTINES_COPY, formatDays, formatRoutinesCopy } from "./routines-copy";
import { cosmicBorders, cosmicColors, cosmicGradients, themes } from "./theme/tokens";

const theme = themes.cosmic;

export type RoutineDetailsScreenContentProps = RoutineDetailsState &
  Omit<RoutineDetailsActions, "handleBack" | "handleEdit" | "handleDeleted"> & {
    onBack: () => void;
    /** Abre a edição da rotina (RF-0009, UC-0007, #137). */
    onEdit: (id: string) => void;
    /** Exclusão confirmada: volta para a lista, que exclui e oferece "Desfazer". */
    onDeleted: (id: string) => void;
  };

const InfoChip = ({ icon, label }: { icon: MaterialSymbolName; label: string }) => (
  <View style={styles.chip}>
    <MaterialSymbol name={icon} filled color={cosmicColors.focus} size={theme.space.md} />
    <Text allowFontScaling style={styles.chipLabel}>
      {label}
    </Text>
  </View>
);

/** Detalhe da rotina e confirmação de exclusão (protótipo 3.2 e 3.3, padrão F8). */
export const RoutineDetailsScreenContent = ({
  routine,
  completedCount,
  doneToday,
  confirmDeleteVisible,
  loading,
  errorKey,
  toggleTask,
  moveTaskUp,
  completeAll,
  undoAll,
  requestDelete,
  cancelDelete,
  onBack,
  onEdit,
  onDeleted,
}: RoutineDetailsScreenContentProps) => {
  const insets = useSafeAreaInsets();

  // F8, Carregando: esqueleto estrutural dos cards da rotina (05-padroes.md).
  if (!routine && loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title={ROUTINES_COPY.title} backLabel={ROUTINES_COPY["details.back"]} onBack={onBack} />
        <View style={styles.content}>
          <SkeletonCards accessibilityLabel={ROUTINES_COPY["details.loading"]} />
        </View>
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title={ROUTINES_COPY.title} backLabel={ROUTINES_COPY["details.back"]} onBack={onBack} />
        <View style={styles.missing}>
          <Text accessibilityRole="header" allowFontScaling style={styles.cardTitle}>
            {ROUTINES_COPY["details.missing.title"]}
          </Text>
          <Text allowFontScaling style={[styles.muted, styles.centered]}>
            {ROUTINES_COPY["details.missing.message"]}
          </Text>
        </View>
      </View>
    );
  }

  const total = routine.tasks.length;
  const percent = total === 0 ? 0 : (completedCount / total) * 100;
  // barra-progresso.md: contador e porcentagem em texto, fora da barra; sem tarefas, sem porcentagem.
  const percentLabel = total === 0 ? null : Math.round(percent);
  const counterLabel =
    percentLabel === null
      ? formatRoutinesCopy("details.progress.counter", { done: completedCount, total })
      : formatRoutinesCopy("details.progress.counterPercent", { done: completedCount, total, percent: percentLabel });
  const progressText =
    percentLabel === null
      ? formatRoutinesCopy("details.progress", { done: completedCount, total })
      : formatRoutinesCopy("details.progress.a11y", { done: completedCount, total, percent: percentLabel });
  // Fora dos dias da rotina, concluir e marcar ficam bloqueados, com o motivo em texto (rotinas.md, R6; botao.md).
  const inactive = !routine.activeToday;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={routine.title} backLabel={ROUTINES_COPY["details.back"]} onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
          <View style={styles.summaryRow}>
            <IconTile icon={routine.icon} />
            <View style={styles.summaryText}>
              <Text allowFontScaling style={styles.cardTitle}>
                {routine.title}
              </Text>
              {routine.description ? (
                <Text allowFontScaling style={styles.muted}>
                  {routine.description}
                </Text>
              ) : null}
            </View>
            {/* A edição reaproveita o formulário de Nova rotina (#137); vale em qualquer dia. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={ROUTINES_COPY["details.edit"]}
              accessibilityHint={ROUTINES_COPY["details.edit.hint"]}
              onPress={() => onEdit(routine.id)}
              style={({ pressed }) => [styles.edit, pressed && styles.pressed]}
            >
              <MaterialSymbol name="edit" color={theme.color["on-surface"]} size={theme.space.md} />
              <Text allowFontScaling style={styles.editLabel}>
                {ROUTINES_COPY["details.edit"]}
              </Text>
            </Pressable>
          </View>
          <View style={styles.chips}>
            <InfoChip icon="calendar_today" label={formatDays(routine.days)} />
            {routine.timeLabel ? <InfoChip icon="schedule" label={routine.timeLabel} /> : null}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text accessibilityRole="header" allowFontScaling style={styles.sectionTitle}>
              {ROUTINES_COPY["details.tasks"]}
            </Text>
            <Text allowFontScaling style={styles.counter}>
              {counterLabel}
            </Text>
          </View>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={ROUTINES_COPY["details.progress.label"]}
            accessibilityValue={{ min: 0, max: total, now: completedCount, text: progressText }}
            style={styles.track}
          >
            {percent > 0 ? (
              <View style={[styles.fill, { width: `${percent}%` }]}>
                <GradientSurface from={cosmicGradients.progress[0]} to={cosmicGradients.progress[1]} horizontal />
              </View>
            ) : null}
          </View>

          {routine.tasks.map((task, index) => (
            <View key={task.id} style={styles.task}>
              <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={formatRoutinesCopy(index === 0 ? "task.first" : "task.moveUp", { name: task.title })}
                onPress={() => moveTaskUp(index)}
                style={styles.handle}
              >
                <MaterialSymbol name="drag_indicator" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
              </Pressable>
              <CheckCircle
                checked={task.done}
                onToggle={() => toggleTask(task.id)}
                disabled={inactive}
                accessibilityLabel={formatRoutinesCopy(task.done ? "task.uncomplete" : "task.complete", { name: task.title })}
              />
              <Text allowFontScaling style={[styles.taskTitle, task.done && styles.taskDone]}>
                {task.title}
              </Text>
            </View>
          ))}

          {/* F8, Vazio: texto e atalho para adicionar tarefas, que abre a edição. */}
          {total === 0 ? (
            <View style={styles.emptyTasks}>
              <Text allowFontScaling style={styles.muted}>
                {ROUTINES_COPY["details.tasks.empty"]}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={ROUTINES_COPY["details.tasks.add"]}
                onPress={() => onEdit(routine.id)}
                style={({ pressed }) => [styles.edit, pressed && styles.pressed]}
              >
                <MaterialSymbol name="add" color={theme.color["on-surface"]} size={theme.space.md} />
                <Text allowFontScaling style={styles.editLabel}>
                  {ROUTINES_COPY["details.tasks.add"]}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {errorKey ? (
            <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.alert}>
              <MaterialSymbol name="error" filled color={theme.color.error} size={theme.navbar.iconSize} />
              <Text allowFontScaling style={styles.alertText}>
                {ROUTINES_COPY[errorKey]}
              </Text>
            </View>
          ) : null}

          {doneToday ? (
            <View accessible accessibilityRole="text" accessibilityLiveRegion="polite" style={styles.celebration}>
              <MaterialSymbol name="auto_awesome" filled color={cosmicColors.focus} size={theme.navbar.iconSize} />
              <Text allowFontScaling style={styles.celebrationText}>
                {ROUTINES_COPY["details.allDone"]}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ROUTINES_COPY["details.delete"]}
          onPress={requestDelete}
          style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
        >
          <MaterialSymbol name="delete_outline" color={theme.color.error} size={theme.navbar.iconSize} />
          <Text allowFontScaling style={styles.deleteLabel}>
            {ROUTINES_COPY["details.delete"]}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space.md }]}>
        {inactive ? (
          <Text allowFontScaling style={[styles.muted, styles.centered]}>
            {ROUTINES_COPY["inactive.today"]}
          </Text>
        ) : null}
        {doneToday ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ROUTINES_COPY["details.undoAll"]}
            accessibilityState={{ disabled: inactive }}
            disabled={inactive}
            onPress={undoAll}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <MaterialSymbol name="undo" color={theme.color["on-surface"]} size={theme.navbar.iconSize} />
            <Text allowFontScaling style={styles.secondaryLabel}>
              {ROUTINES_COPY["details.undoAll"]}
            </Text>
          </Pressable>
        ) : (
          <PrimaryButton
            theme={theme}
            label={ROUTINES_COPY["details.completeAll"]}
            icon={
              <MaterialSymbol
                name="check"
                color={inactive ? theme.button.labelDisabled : theme.button.label}
                size={theme.navbar.iconSize}
              />
            }
            onPress={completeAll}
            disabled={inactive}
          />
        )}
      </View>

      <ConfirmDialog
        visible={confirmDeleteVisible}
        icon="delete_outline"
        title={formatRoutinesCopy("delete.title", { name: routine.title })}
        message={total === 1 ? ROUTINES_COPY["delete.message.one"] : formatRoutinesCopy("delete.message.other", { n: total })}
        cancelLabel={ROUTINES_COPY["delete.cancel"]}
        confirmLabel={ROUTINES_COPY["delete.confirm"]}
        onCancel={cancelDelete}
        onConfirm={() => {
          cancelDelete();
          onDeleted(routine.id);
        }}
      >
        <View style={styles.note}>
          <MaterialSymbol name="auto_awesome" filled color={cosmicColors.focus} size={theme.navbar.iconSize} />
          <Text allowFontScaling style={styles.noteText}>
            {ROUTINES_COPY["delete.note"]}
          </Text>
        </View>
      </ConfirmDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface },
  scroll: { flex: 1 },
  content: { gap: theme.space.lg, paddingHorizontal: theme.space.md, paddingTop: theme.space.sm, paddingBottom: theme.space.lg },
  muted: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
  centered: { textAlign: "center" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: theme.primitive["space-4"], padding: theme.space.lg },
  summary: {
    gap: theme.space.md,
    padding: theme.space.md,
    borderRadius: theme.radius.lg,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.card,
    backgroundColor: cosmicColors.card,
    overflow: "hidden",
  },
  summaryRow: { flexDirection: "row", alignItems: "flex-start", gap: theme.space.md },
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
    borderColor: theme.color.action,
    backgroundColor: theme.color["action-subtle"],
  },
  emptyTasks: { alignItems: "flex-start", gap: theme.space.sm },
  editLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: theme.space.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    paddingVertical: theme.primitive["space-4"],
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.navbar.bg,
  },
  chipLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  section: { gap: theme.space.sm },
  sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: theme.space.sm },
  sectionTitle: { ...theme.font["card-title"], color: theme.color["on-surface"] },
  counter: { ...theme.font.label, color: theme.color["on-surface"] },
  track: { height: theme.progress.height, borderRadius: theme.progress.height / 2, backgroundColor: theme.progress.track, overflow: "hidden" },
  fill: { height: "100%", borderRadius: theme.progress.height / 2, overflow: "hidden" },
  task: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.primitive["space-4"],
    borderRadius: theme.radius.lg,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.card,
    backgroundColor: cosmicColors.card,
    overflow: "hidden",
  },
  handle: { width: theme.target.minSize, height: theme.target.minSize, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md },
  taskTitle: { ...theme.font.body, color: theme.color["on-surface"], flex: 1, minWidth: 0, paddingRight: theme.space.sm },
  taskDone: { textDecorationLine: "line-through", color: theme.color["on-surface-variant"] },
  celebration: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
    padding: theme.space.md,
    borderRadius: theme.radius.lg,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color.action,
    backgroundColor: theme.color["action-subtle"],
  },
  celebrationText: { ...theme.font.label, color: theme.color["on-surface"], flex: 1 },
  delete: {
    minHeight: theme.target.minSize,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space.sm,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
  },
  deleteLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  pressed: { opacity: theme.motion.opacityPressed },
  footer: {
    gap: theme.space.sm,
    paddingTop: theme.space.md,
    paddingHorizontal: theme.space.md,
    backgroundColor: theme.navbar.bg,
    borderTopWidth: theme.border.widthThin,
    borderTopColor: theme.color["border-subtle"],
    boxShadow: theme.shadow.bar,
  },
  secondary: {
    minHeight: theme.target.minSize,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space.sm,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color.action,
    backgroundColor: theme.color["action-subtle"],
  },
  secondaryLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.space.md,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.navbar.bg,
  },
  noteText: { ...theme.font["body-sm"], color: theme.color["on-surface"], flex: 1 },
  // Erro com ícone em color.error e texto em color.on-surface (05-padroes.md; WCAG 1.4.1).
  alert: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  alertText: { ...theme.font.label, color: theme.color["on-surface"], flex: 1 },
});
