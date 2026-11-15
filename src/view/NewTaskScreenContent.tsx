import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NewTaskActions, NewTaskFields, NewTaskState } from "../viewmodel/NewTaskViewModel";
import { MaterialSymbol } from "./components/material-symbol";
import { PrimaryButton } from "./components/primary-button";
import { ScreenHeader } from "./components/ScreenHeader";
import { SuccessDialog } from "./components/SuccessDialog";
import { TextField } from "./components/TextField";
import { TASKS_COPY } from "./tasks-copy";
import { cosmicColors, themes } from "./theme/tokens";

const theme = themes.cosmic;

export type NewTaskScreenContentProps = NewTaskState &
  NewTaskActions & {
    /** Fecha o formulário sem criar e volta para Tarefas. */
    onClose: () => void;
    /** Depois do sucesso: limpa o formulário e volta para a lista. */
    onFinish: () => void;
  };

type DateTimeGroupProps = {
  legend: string;
  dateField: keyof NewTaskFields;
  timeField: keyof NewTaskFields;
  fields: NewTaskFields;
  setField: NewTaskActions["setField"];
};

/** Data e hora em colunas que podem encolher (campos-formulario.md), para não passar da tela. */
const DateTimeGroup = ({ legend, dateField, timeField, fields, setField }: DateTimeGroupProps) => (
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
          keyboardType="numbers-and-punctuation"
        />
      </View>
      <View style={styles.timeColumn}>
        <TextField
          label={TASKS_COPY["form.time"]}
          value={fields[timeField]}
          onChangeText={(value) => setField(timeField, value)}
          placeholder={TASKS_COPY["form.time.placeholder"]}
          keyboardType="numbers-and-punctuation"
        />
      </View>
    </View>
  </View>
);

/** Formulário de Nova tarefa e confirmação "Tarefa criada!" (protótipo 2.1 e 2.2). */
export const NewTaskScreenContent = ({
  fields,
  titleError,
  created,
  setField,
  submit,
  onClose,
  onFinish,
}: NewTaskScreenContentProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={TASKS_COPY["form.title"]} variant="close" backLabel={TASKS_COPY["form.close"]} onBack={onClose} />
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
        <DateTimeGroup legend={TASKS_COPY["form.start"]} dateField="startDate" timeField="startTime" fields={fields} setField={setField} />
        <DateTimeGroup legend={TASKS_COPY["form.end"]} dateField="endDate" timeField="endTime" fields={fields} setField={setField} />
        <View style={styles.group}>
          <Text allowFontScaling style={styles.legend}>
            {TASKS_COPY["form.category"]} <Text style={styles.optional}>(opcional)</Text>
          </Text>
          {/* A escolha de categoria chega com o domínio de Tarefas; o campo aparece desabilitado. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${TASKS_COPY["form.category"]}: ${TASKS_COPY["form.category.empty"]}`}
            accessibilityHint={TASKS_COPY["form.category.soon"]}
            accessibilityState={{ disabled: true }}
            disabled
            style={styles.select}
          >
            <View style={styles.selectIcon}>
              <MaterialSymbol name="label" filled color={cosmicColors.focus} size={theme.space.lg} />
            </View>
            <Text allowFontScaling style={styles.selectValue}>
              {TASKS_COPY["form.category.empty"]}
            </Text>
            <MaterialSymbol name="chevron_right" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
          </Pressable>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space.md }]}>
        <PrimaryButton theme={theme} label={TASKS_COPY["form.submit"]} onPress={submit} />
      </View>
      <SuccessDialog
        visible={created}
        title={TASKS_COPY["created.title"]}
        message={TASKS_COPY["created.message"]}
        actionLabel={TASKS_COPY["created.action"]}
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
    borderColor: theme.color["border-subtle"],
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
  footer: {
    paddingTop: theme.space.md,
    paddingHorizontal: theme.space.md,
    backgroundColor: theme.navbar.bg,
    borderTopWidth: theme.border.widthThin,
    borderTopColor: theme.color["border-subtle"],
    boxShadow: theme.shadow.bar,
  },
});
