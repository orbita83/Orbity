import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NewRoutineActions, NewRoutineState } from "../viewmodel/NewRoutineViewModel";
import { ROUTINE_ICONS } from "../viewmodel/RoutinesViewModel";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { GradientSurface } from "./components/GradientSurface";
import { MaterialSymbol } from "./components/MaterialSymbol";
import { PrimaryButton } from "./components/PrimaryButton";
import { ScreenHeader } from "./components/ScreenHeader";
import { SkeletonCards } from "./components/SkeletonCards";
import { SuccessDialog } from "./components/SuccessDialog";
import { TextField } from "./components/TextField";
import { ROUTINE_ICON_LABELS, ROUTINES_COPY, formatDays, formatRoutinesCopy, weekdayLong, weekdayShort } from "./routines-copy";
import { cosmicBorders, cosmicColors, cosmicGradients, themes } from "./theme/tokens";

const theme = themes.cosmic;
const WEEK = [0, 1, 2, 3, 4, 5, 6] as const;

export type NewRoutineScreenContentProps = NewRoutineState &
  NewRoutineActions & {
    /** Sai sem salvar: volta para a lista (criação) ou para o detalhe (edição). */
    onBack: () => void;
    /** Fecha o "Rotina criada!"/"Rotina atualizada!" e volta (05-padroes.md, F7, passo 4). */
    onFinish: () => void;
  };

const FieldError = ({ message }: { message: string }) => (
  <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
    <MaterialSymbol name="error" filled color={theme.color.error} size={theme.navbar.iconSize} />
    <Text allowFontScaling style={styles.errorText}>
      {message}
    </Text>
  </View>
);

const GroupLabel = ({ label, requirement }: { label: string; requirement: "obrigatório" | "opcional" }) => (
  <Text accessibilityRole="header" allowFontScaling style={styles.groupLabel}>
    {label} <Text style={styles.requirement}>({requirement})</Text>
  </Text>
);

/**
 * Formulário de Nova rotina (protótipo 3.1, RF-0007 e RF-0012). Também é a edição (RF-0009, UC-0007,
 * #137): mesmos campos preenchidos, "Salvar alterações" e confirmação ao sair com alterações.
 */
export const NewRoutineScreenContent = ({
  name,
  icon,
  description,
  days,
  tasks,
  draft,
  nameError,
  daysError,
  formError,
  submitting,
  created,
  editing,
  loading,
  discardVisible,
  setName,
  setIcon,
  setDescription,
  toggleDay,
  setDraft,
  addTask,
  removeTask,
  moveTaskUp,
  submit,
  requestLeave,
  cancelLeave,
  onBack,
  onFinish,
}: NewRoutineScreenContentProps) => {
  const insets = useSafeAreaInsets();
  const leave = () => {
    if (requestLeave()) onBack();
  };
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={editing ? ROUTINES_COPY["form.editTitle"] : ROUTINES_COPY["form.title"]}
        backLabel={editing ? ROUTINES_COPY["form.editBack"] : ROUTINES_COPY["form.back"]}
        onBack={leave}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* F8, Carregando: esqueleto enquanto a rotina a editar chega. */}
        {loading ? (
          <SkeletonCards accessibilityLabel={ROUTINES_COPY["details.loading"]} />
        ) : (
          <>
            <TextField
              label={ROUTINES_COPY["form.name"]}
              requirement="required"
              value={name}
              onChangeText={setName}
              placeholder={ROUTINES_COPY["form.name.placeholder"]}
              error={nameError ? ROUTINES_COPY["form.name.error"] : null}
            />

            <View style={styles.group}>
              <GroupLabel label={ROUTINES_COPY["form.icon"]} requirement="opcional" />
              <View accessibilityRole="radiogroup" accessibilityLabel={ROUTINES_COPY["form.icon"]} style={styles.grid}>
                {ROUTINE_ICONS.map((option) => {
                  const selected = option === icon;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="radio"
                      accessibilityLabel={ROUTINE_ICON_LABELS[option]}
                      accessibilityState={{ checked: selected }}
                      aria-checked={selected}
                      onPress={() => setIcon(option)}
                      style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && styles.pressed]}
                    >
                      <MaterialSymbol name={option} filled color={selected ? theme.color["on-action"] : cosmicColors.focus} size={theme.navbar.iconSize} />
                    </Pressable>
                  );
                })}
              </View>
              <Text allowFontScaling style={styles.helper}>
                {ROUTINES_COPY["form.icon.helper"]}
              </Text>
            </View>

            <TextField
              label={ROUTINES_COPY["form.description"]}
              requirement="optional"
              value={description}
              onChangeText={setDescription}
              placeholder={ROUTINES_COPY["form.description.placeholder"]}
              multiline
            />

            <View style={styles.group}>
              <GroupLabel label={ROUTINES_COPY["form.days"]} requirement="obrigatório" />
              <View style={styles.grid}>
                {WEEK.map((day) => {
                  const on = days.includes(day);
                  return (
                    <Pressable
                      key={day}
                      accessibilityRole="checkbox"
                      accessibilityLabel={weekdayLong(day)}
                      accessibilityState={{ checked: on }}
                      aria-checked={on}
                      onPress={() => toggleDay(day)}
                      style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && styles.pressed]}
                    >
                      <Text allowFontScaling style={[styles.dayLabel, on && styles.dayLabelOn]}>
                        {weekdayShort(day)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text allowFontScaling style={styles.helper}>
                {days.length > 0 ? formatDays(days) : ROUTINES_COPY["form.days.helper"]}
              </Text>
              {daysError ? <FieldError message={ROUTINES_COPY["form.days.error"]} /> : null}
            </View>

            <View style={styles.group}>
              <GroupLabel label={`${ROUTINES_COPY["form.tasks"]}`} requirement="opcional" />
              {tasks.map((title, index) => (
                <View key={`${title}-${index}`} style={styles.task}>
                  <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={formatRoutinesCopy(index === 0 ? "task.first" : "task.moveUp", { name: title })}
                    onPress={() => moveTaskUp(index)}
                    style={styles.iconButton}
                  >
                    <MaterialSymbol name="drag_indicator" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
                  </Pressable>
                  <Text allowFontScaling numberOfLines={1} style={styles.taskTitle}>
                    <Text style={styles.requirement}>{index + 1}. </Text>
                    {title}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={formatRoutinesCopy("task.remove", { name: title })}
                    onPress={() => removeTask(index)}
                    style={styles.iconButton}
                  >
                    <MaterialSymbol name="close" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
                  </Pressable>
                </View>
              ))}
              {tasks.length === 0 ? (
                <Text allowFontScaling style={styles.helper}>
                  {ROUTINES_COPY["form.tasks.empty"]}
                </Text>
              ) : null}
              <View style={styles.addRow}>
                <TextInput
                  accessibilityLabel={ROUTINES_COPY["form.tasks.draftLabel"]}
                  allowFontScaling
                  value={draft}
                  onChangeText={setDraft}
                  onSubmitEditing={addTask}
                  placeholder={ROUTINES_COPY["form.tasks.add"]}
                  placeholderTextColor={cosmicColors.inactive}
                  returnKeyType="done"
                  style={styles.addInput}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={ROUTINES_COPY["form.tasks.addLabel"]}
                  onPress={addTask}
                  style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                >
                  <MaterialSymbol name="add" color={theme.color["on-surface"]} size={theme.navbar.iconSize} />
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space.md }]}>
        {/* Falha ao salvar: texto e ícone, e o formulário continua preenchido (05-padroes.md, F7). */}
        {formError ? <FieldError message={formError} /> : null}
        <PrimaryButton
          theme={theme}
          label={editing ? ROUTINES_COPY["form.editSubmit"] : ROUTINES_COPY["form.submit"]}
          onPress={submit}
          disabled={submitting || loading}
        />
      </View>
      {/* Variante Sucesso do Modal (modal.md), como o "Tarefa criada!" de Tarefas. */}
      <SuccessDialog
        visible={created}
        title={editing ? ROUTINES_COPY["updated.title"] : ROUTINES_COPY["created.title"]}
        message={editing ? ROUTINES_COPY["updated.message"] : ROUTINES_COPY["created.message"]}
        actionLabel={editing ? ROUTINES_COPY["updated.action"] : ROUTINES_COPY["created.action"]}
        onClose={onFinish}
      />
      {/* Variante Confirmação do Modal: a ação segura ("Continuar editando") fica em destaque. */}
      <ConfirmDialog
        visible={discardVisible}
        icon="edit"
        title={ROUTINES_COPY["discard.title"]}
        message={ROUTINES_COPY["discard.message"]}
        cancelLabel={ROUTINES_COPY["discard.cancel"]}
        confirmLabel={ROUTINES_COPY["discard.confirm"]}
        onCancel={cancelLeave}
        onConfirm={() => {
          cancelLeave();
          onBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface },
  scroll: { flex: 1 },
  form: { gap: theme.space.lg, paddingHorizontal: theme.space.md, paddingTop: theme.space.sm, paddingBottom: theme.space.lg },
  group: { gap: theme.space.sm },
  groupLabel: { ...theme.font.label, color: theme.color["on-surface-variant"] },
  requirement: { color: theme.color["on-surface-variant"] },
  helper: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
  grid: { flexDirection: "row", gap: theme.primitive["space-4"] },
  option: {
    flex: 1,
    minWidth: 0,
    minHeight: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.navbar.bg,
  },
  optionOn: { backgroundColor: theme.color.action, borderColor: theme.color.action, borderWidth: theme.focus.ringWidth },
  pressed: { opacity: theme.motion.opacityPressed },
  dayLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  dayLabelOn: { fontWeight: "700", color: theme.color["on-action"] },
  error: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  errorText: { ...theme.font.label, color: theme.color["on-surface"], flex: 1 },
  task: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.primitive["space-4"],
    padding: theme.primitive["space-4"],
    borderRadius: theme.radius.lg,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.card,
    backgroundColor: cosmicColors.card,
    overflow: "hidden",
  },
  taskTitle: { ...theme.font.body, color: theme.color["on-surface"], flex: 1, minWidth: 0 },
  iconButton: {
    width: theme.target.minSize,
    height: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
  },
  addRow: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  addInput: {
    ...theme.font.body,
    flex: 1,
    minWidth: 0,
    minHeight: theme.target.minSize,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderStyle: "dashed",
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.navbar.bg,
    color: theme.color["on-surface"],
  },
  addButton: {
    width: theme.target.minSize,
    height: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color.action,
    backgroundColor: theme.color["action-subtle"],
  },
  footer: {
    gap: theme.space.sm,
    paddingTop: theme.space.md,
    paddingHorizontal: theme.space.md,
    backgroundColor: theme.navbar.bg,
    borderTopWidth: theme.border.widthThin,
    borderTopColor: theme.color["border-subtle"],
    boxShadow: theme.shadow.bar,
  },
});
