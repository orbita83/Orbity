import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type {
  NewTaskActions,
  NewTaskFields,
  NewTaskPickerField,
  NewTaskState,
  NewTaskTextField,
} from "../viewmodel/useNewTaskViewModel";
import { MaterialSymbol } from "./components/MaterialSymbol";
import { PrimaryButton } from "./components/PrimaryButton";
import { SafeInputArea } from "./components/SafeInputArea";
import { ScreenHeader } from "./components/ScreenHeader";
import { SuccessDialog } from "./components/SuccessDialog";
import { TaskPickerModal, type TaskPickerModalOption } from "./components/TaskPickerModal";
import { NO_CATEGORY_SYMBOL, resolveCategoryDisplay } from "./categoryCopy";
import { TextField } from "./components/TextField";
import { TASKS_COPY, formatTasksCopy } from "./tasksCopy";
import { cosmicColors, themes } from "./theme/tokens";
import { CosmicSky } from "./components/CosmicSky";

const theme = themes.cosmic;

export type NewTaskScreenContentProps = NewTaskState &
  Omit<NewTaskActions, "handleClose"> & {
    /** Fecha o formulário sem criar e volta para Tarefas. */
    onClose: () => void;
    /** Depois do sucesso: limpa o formulário e volta para a lista. */
    onFinish: () => void;
  };

type DateTimeGroupProps = {
  legend: string;
  dateField: Extract<NewTaskTextField, "startDate" | "endDate">;
  timeField: Extract<NewTaskTextField, "startTime" | "endTime">;
  fields: NewTaskFields;
  setField: NewTaskActions["setField"];
  openPicker: NewTaskActions["openPicker"];
};

/** Data e hora em colunas que podem encolher (campos-formulario.md), para não passar da tela. */
const DateTimeGroup = ({ legend, dateField, timeField, fields, setField, openPicker }: DateTimeGroupProps) => (
  <View style={styles.group}>
    <Text accessibilityRole="header" allowFontScaling style={styles.legend}>
      {legend}
    </Text>
    <View style={styles.row}>
      <View style={styles.dateColumn}>
        <TextField
          label={TASKS_COPY["form.date"]}
          value={fields[dateField]}
          onChangeText={(value) => setField(dateField, value)}
          placeholder={TASKS_COPY["form.date.placeholder"]}
          keyboardType="numeric"
          maxLength={10}
          trailingIcon="calendar_today"
          trailingLabel={formatTasksCopy("picker.openDate", { field: legend })}
          onTrailingPress={() => openPicker(dateField)}
        />
      </View>
      <View style={styles.timeColumn}>
        <TextField
          label={TASKS_COPY["form.time"]}
          value={fields[timeField]}
          onChangeText={(value) => setField(timeField, value)}
          placeholder={TASKS_COPY["form.time.placeholder"]}
          keyboardType="numeric"
          maxLength={5}
          trailingIcon="schedule"
          trailingLabel={formatTasksCopy("picker.openTime", { field: legend })}
          onTrailingPress={() => openPicker(timeField)}
        />
      </View>
    </View>
  </View>
);

const pickerTitleOf = (picker: NewTaskPickerField | null): string => {
  if (picker === "startDate" || picker === "endDate") {
    return TASKS_COPY["picker.date.title"];
  }
  if (picker === "startTime" || picker === "endTime") {
    return TASKS_COPY["picker.time.title"];
  }
  return TASKS_COPY["picker.category.title"];
};

/** Formulário de Nova tarefa e confirmação "Tarefa criada!" (protótipo 2.1 e 2.2). */
export const NewTaskScreenContent = ({
  fields,
  titleError,
  formError,
  reminderPermissionNotice,
  activePicker,
  dateOptions,
  timeOptions,
  categoryOptions,
  categories,
  submitting,
  created,
  editing = false,
  setField,
  selectCategory,
  openPicker,
  closePicker,
  submit,
  onClose,
  onFinish,
}: NewTaskScreenContentProps) => {
  const insets = useSafeAreaInsets();
  const selectedCategoryDisplay = fields.category
    ? resolveCategoryDisplay(fields.category, categories)
    : null;
  const categoryLabel = selectedCategoryDisplay
    ? selectedCategoryDisplay.label
    : TASKS_COPY["form.category.empty"];
  const categorySymbol = selectedCategoryDisplay ? selectedCategoryDisplay.symbol : NO_CATEGORY_SYMBOL;
  const categoryPickerOptions: readonly TaskPickerModalOption[] = [
    { id: "none", label: TASKS_COPY["form.category.empty"], value: "", icon: NO_CATEGORY_SYMBOL },
    ...categoryOptions.map((id) => {
      const display = resolveCategoryDisplay(id, categories);
      return {
        id,
        label: display.label,
        value: id,
        icon: display.symbol,
      };
    }),
  ];

  const activePickerOptions =
    activePicker === "startDate" || activePicker === "endDate"
      ? dateOptions
      : activePicker === "startTime" || activePicker === "endTime"
        ? timeOptions
        : categoryPickerOptions;

  const activeSelectedValue =
    activePicker === "category"
      ? (fields.category ?? "")
      : activePicker
        ? fields[activePicker]
        : "";

  const handleSelectPickerValue = (value: string) => {
    if (!activePicker) {
      return;
    }
    if (activePicker === "category") {
      selectCategory(value || undefined);
      return;
    }
    setField(activePicker, value);
    closePicker();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <CosmicSky />
      <ScreenHeader
        title={editing ? TASKS_COPY["form.editTitle"] : TASKS_COPY["form.title"]}
        variant="close"
        backLabel={editing ? TASKS_COPY["form.editClose"] : TASKS_COPY["form.close"]}
        onBack={onClose}
      />
      <SafeInputArea>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <TextField
            label={TASKS_COPY["form.name"]}
            requirement="required"
            value={fields.title}
            onChangeText={(value) => setField("title", value)}
            placeholder={TASKS_COPY["form.name.placeholder"]}
            error={titleError ? TASKS_COPY["form.name.error"] : null}
          />
          <TextField
            label={TASKS_COPY["form.description"]}
            requirement="optional"
            value={fields.description}
            onChangeText={(value) => setField("description", value)}
            placeholder={TASKS_COPY["form.description.placeholder"]}
            multiline
          />
          <DateTimeGroup
            legend={TASKS_COPY["form.start"]}
            dateField="startDate"
            timeField="startTime"
            fields={fields}
            setField={setField}
            openPicker={openPicker}
          />
          <DateTimeGroup
            legend={TASKS_COPY["form.end"]}
            dateField="endDate"
            timeField="endTime"
            fields={fields}
            setField={setField}
            openPicker={openPicker}
          />

          <View style={styles.group}>
            <Text allowFontScaling style={styles.legend}>
              {TASKS_COPY["form.category"]} <Text style={styles.optional}>(opcional)</Text>
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${TASKS_COPY["form.category"]}: ${categoryLabel}`}
              accessibilityHint={TASKS_COPY["form.category.choose"]}
              onPress={() => openPicker("category")}
              style={({ pressed }) => [styles.select, pressed && styles.pressed]}
            >
              <View style={styles.selectIcon}>
                <MaterialSymbol
                  name={categorySymbol}
                  filled
                  color={cosmicColors.focus}
                  size={theme.space.lg}
                />
              </View>
              <Text allowFontScaling style={styles.selectValue}>
                {categoryLabel}
              </Text>
              <MaterialSymbol name="chevron_right" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
            </Pressable>
          </View>

          {formError ? (
            <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.formError}>
              <MaterialSymbol name="error" filled color={theme.color.error} size={theme.navbar.iconSize} />
              <Text allowFontScaling style={styles.formErrorText}>
                {formError}
              </Text>
            </View>
          ) : null}

          {reminderPermissionNotice ? (
            <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.formError}>
              <MaterialSymbol name="schedule" filled color={cosmicColors.focus} size={theme.navbar.iconSize} />
              <Text allowFontScaling style={styles.formErrorText}>
                {reminderPermissionNotice}
              </Text>
            </View>
          ) : null}
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space.md }]}>
          <PrimaryButton
            theme={theme}
            label={editing ? TASKS_COPY["form.editSubmit"] : TASKS_COPY["form.submit"]}
            onPress={submit}
            disabled={submitting}
          />
        </View>
      </SafeInputArea>
      <TaskPickerModal
        visible={activePicker !== null}
        title={pickerTitleOf(activePicker)}
        closeLabel={TASKS_COPY["picker.close"]}
        options={activePickerOptions}
        selectedValue={activeSelectedValue}
        onSelect={handleSelectPickerValue}
        onClose={closePicker}
      />
      <SuccessDialog
        visible={created}
        title={editing ? TASKS_COPY["updated.title"] : TASKS_COPY["created.title"]}
        message={
          reminderPermissionNotice ??
          (editing ? TASKS_COPY["updated.message"] : TASKS_COPY["created.message"])
        }
        actionLabel={editing ? TASKS_COPY["updated.action"] : TASKS_COPY["created.action"]}
        onClose={onFinish}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface },
  scroll: { flex: 1 },
  form: { gap: theme.space.lg, paddingHorizontal: theme.space.md, paddingTop: theme.space.sm, paddingBottom: theme.space.lg },
  group: { gap: theme.space.sm },
  legend: { ...theme.font.label, color: theme.color["on-surface"] },
  optional: { color: theme.color["on-surface-variant"] },
  row: { flexDirection: "row", gap: theme.space.sm },
  dateColumn: { flex: 3, minWidth: 0 },
  timeColumn: { flex: 2, minWidth: 0 },
  select: {
    minHeight: theme.target.minSize,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    paddingVertical: theme.space.sm,
    paddingLeft: theme.space.sm,
    paddingRight: theme.space.sm,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-control"],
    backgroundColor: theme.color["surface-variant"],
  },
  selectIcon: {
    width: theme.space.lg + theme.space.md,
    height: theme.space.lg + theme.space.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color["action-subtle"],
    alignItems: "center",
    justifyContent: "center",
  },
  selectValue: { ...theme.font.body, color: theme.color["on-surface"], flex: 1 },
  pressed: { opacity: theme.motion.opacityPressed },
  formError: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-subtle"],
    backgroundColor: theme.color["surface-variant"],
  },
  formErrorText: { ...theme.font.label, color: theme.color["on-surface"], flex: 1 },
  footer: {
    paddingTop: theme.space.md,
    paddingHorizontal: theme.space.md,
    backgroundColor: theme.navbar.bg,
    borderTopWidth: theme.border.widthThin,
    borderTopColor: theme.color["border-subtle"],
    boxShadow: theme.shadow.bar,
  },
});
