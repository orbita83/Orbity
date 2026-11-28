import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { TaskFilter, TasksActions, TasksState } from "../viewmodel/useTasksViewModel";
import { TaskCard } from "./components/TaskCard";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ContextualActionBar, ContextualHeader } from "./components/ContextualActionBar";
import { EmptyOrbitState } from "./components/EmptyOrbitState";
import { FilterChips, type FilterChipOption } from "./components/FilterChips";
import { MaterialSymbol } from "./components/MaterialSymbol";
import { PrimaryButton } from "./components/PrimaryButton";
import { resolveCategoryDisplay } from "./categoryCopy";
import { TASKS_COPY, formatTasksCopy } from "./tasksCopy";
import { themes } from "./theme/tokens";

const theme = themes.cosmic;

const FILTERS: readonly FilterChipOption<TaskFilter>[] = [
  { id: "all", label: TASKS_COPY["filter.all"] },
  { id: "pending", label: TASKS_COPY["filter.pending"] },
  { id: "completed", label: TASKS_COPY["filter.completed"] },
];

export type TasksScreenContentProps = TasksState &
  Omit<TasksActions, "handleCreateTask" | "handleEditTask"> & {
    onCreateTask: () => void;
    onEditTask?: (id: string) => void;
  };

// Estado vazio por filtro (ODS 1.3): sem registros, só pendentes ou só concluídas.
const emptyCopyOf = (filter: TaskFilter, totalCount: number) => {
  if (totalCount === 0 || filter === "all") return { title: TASKS_COPY["empty.title"], message: TASKS_COPY["empty.message"] };
  return filter === "pending"
    ? { title: TASKS_COPY["empty.pending.title"], message: TASKS_COPY["empty.pending.message"] }
    : { title: TASKS_COPY["empty.completed.title"], message: TASKS_COPY["empty.completed.message"] };
};

const summaryOf = (pendingCount: number, totalCount: number) => {
  if (totalCount === 0) return TASKS_COPY["summary.empty"];
  if (pendingCount === 0) return TASKS_COPY["summary.allDone"];
  return pendingCount === 1 ? TASKS_COPY["summary.one"] : formatTasksCopy("summary.other", { n: pendingCount });
};

/** Lista de Tarefas (protótipo 2 e 2.3), só de apresentação: estado e ações chegam por props. */
export const TasksScreenContent = ({
  visibleTasks,
  pendingCount,
  totalCount,
  filter,
  selectionMode,
  selectedIds,
  allSelectedPinned,
  confirmDeleteVisible,
  categories,
  loading,
  errorKey,
  selectFilter,
  toggleCompleted,
  startSelection,
  toggleSelected,
  cancelSelection,
  selectAll,
  pinSelected,
  requestDelete,
  cancelDelete,
  confirmDelete,
  reload,
  onCreateTask,
  onEditTask,
}: TasksScreenContentProps) => {
  const insets = useSafeAreaInsets();
  const selectedCount = selectedIds.length;

  return (
    <View style={styles.screen}>
      {selectionMode ? (
        <ContextualHeader
          countLabel={selectedCount === 1 ? TASKS_COPY["selection.one"] : formatTasksCopy("selection.other", { n: selectedCount })}
          onCancel={cancelSelection}
        />
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, !selectionMode && { paddingTop: insets.top + theme.primitive["space-32"] }]}
      >
        {selectionMode ? (
          <Text allowFontScaling style={styles.summary}>
            {TASKS_COPY["selection.hint"]}
          </Text>
        ) : (
          <>
            <View style={styles.heading}>
              <Text accessibilityRole="header" allowFontScaling style={styles.title}>
                {TASKS_COPY.title}
              </Text>
              {/* ODS 1.3: com a lista vazia, o resumo some; a mensagem do planeta já diz o mesmo. */}
              {totalCount > 0 ? (
                <Text allowFontScaling style={styles.summary}>
                  {summaryOf(pendingCount, totalCount)}
                </Text>
              ) : null}
            </View>
            <FilterChips
              theme={theme}
              filters={FILTERS}
              selectedFilter={filter}
              onSelectFilter={selectFilter}
              accessibilityLabel={TASKS_COPY.filters}
            />
            <PrimaryButton
              theme={theme}
              label={TASKS_COPY.new}
              icon={<MaterialSymbol name="add" color={theme.button.label} size={theme.navbar.iconSize} />}
              onPress={onCreateTask}
            />
          </>
        )}

        <View style={styles.list}>
          {errorKey ? (
            <View style={styles.errorCard}>
              <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.errorHeader}>
                <MaterialSymbol name="error" filled color={theme.color.error} size={theme.navbar.iconSize} />
                <Text allowFontScaling style={styles.errorText}>
                  {TASKS_COPY[errorKey]}
                </Text>
              </View>
              <PrimaryButton theme={theme} label={TASKS_COPY["error.retry"]} onPress={() => void reload()} />
            </View>
          ) : null}
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              theme={theme}
              title={task.title}
              dueDate={task.dueLabel}
              category={
                task.category
                  ? resolveCategoryDisplay(task.category, categories)
                  : undefined
              }
              completed={task.completed}
              pinned={task.pinned}
              onToggleCompleted={() => toggleCompleted(task.id)}
              onLongPress={() => startSelection(task.id)}
              // O "•••" do protótipo abre as mesmas ações da seleção (Fixar, Excluir) para esta tarefa;
              // é também a alternativa acessível ao toque longo.
              onOptionsPress={() => startSelection(task.id)}
              selectionMode={selectionMode}
              selected={selectedIds.includes(task.id)}
              onToggleSelected={() => toggleSelected(task.id)}
            />
          ))}
          {!loading && visibleTasks.length === 0 && !errorKey ? (
            <EmptyOrbitState {...emptyCopyOf(filter, totalCount)} />
          ) : null}
        </View>
      </ScrollView>

      {selectionMode ? (
        <ContextualActionBar
          actions={[
            {
              id: "pin",
              label: allSelectedPinned ? TASKS_COPY["action.unpin"] : TASKS_COPY["action.pin"],
              icon: "push_pin",
              onPress: pinSelected,
              disabled: selectedCount === 0,
            },
            { id: "all", label: TASKS_COPY["action.selectAll"], icon: "done_all", onPress: selectAll },
            {
              id: "delete",
              label: formatTasksCopy("action.delete", { n: selectedCount }),
              icon: "delete_outline",
              onPress: requestDelete,
              destructive: true,
              disabled: selectedCount === 0,
            },
          ]}
        />
      ) : null}

      <ConfirmDialog
        visible={confirmDeleteVisible}
        icon="delete_outline"
        title={selectedCount === 1 ? TASKS_COPY["delete.title.one"] : formatTasksCopy("delete.title.other", { n: selectedCount })}
        message={TASKS_COPY["delete.message"]}
        cancelLabel={TASKS_COPY["delete.cancel"]}
        confirmLabel={TASKS_COPY["delete.confirm"]}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface },
  scroll: { flex: 1 },
  content: {
    gap: theme.space.md,
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.lg,
  },
  heading: { gap: theme.primitive["space-4"] },
  title: { ...theme.font.title, color: theme.color["on-surface"] },
  summary: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
  list: { gap: theme.space.sm },
  errorCard: {
    gap: theme.space.md,
    padding: theme.space.md,
    borderRadius: theme.radius.lg,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-subtle"],
    backgroundColor: theme.color["surface-variant"],
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  errorText: { ...theme.font.body, color: theme.color["on-surface"], flex: 1 },
});
