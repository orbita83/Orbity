import { useState } from "react";
import { Animated, type GestureResponderEvent, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Category } from "@/model/entities/category";
import type { RoutineListItem, RoutinesActions, RoutinesState } from "../viewmodel/useRoutinesViewModel";
import { CheckCircle } from "./components/CheckCircle";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ContextualActionBar, ContextualHeader } from "./components/ContextualActionBar";
import { IconTile } from "./components/IconTile";
import { EmptyOrbitState } from "./components/EmptyOrbitState";
import { MaterialSymbol } from "./components/MaterialSymbol";
import { OptionsMenu, type OptionsMenuAnchor } from "./components/OptionsMenu";
import { PrimaryButton } from "./components/PrimaryButton";
import { SkeletonCards } from "./components/SkeletonCards";
import { Snackbar } from "./components/Snackbar";
import {
  getRoutineIconSymbol,
  ROUTINES_COPY,
  formatDays,
  formatRoutineReturn,
  formatRoutinesCopy,
  taskCountLabel,
} from "./routinesCopy";
import { cosmicBorders, cosmicColors, cosmicGradients, themes } from "./theme/tokens";
import { GradientSurface } from "./components/GradientSurface";
import { useHoldFill } from "./useHoldFill";

const theme = themes.cosmic;

export type RoutinesScreenContentProps = RoutinesState &
  Omit<RoutinesActions, "handleCreateRoutine" | "handleOpenRoutine" | "handleEditRoutine"> & {
    onCreateRoutine: () => void;
    onOpenRoutine: (id: string) => void;
    /** "•••" → Editar. */
    onEditRoutine?: (id: string) => void;
  };

// ODS 1.3: o resumo ao lado de "Hoje" sai; o CheckCircle de cada card já mostra o que foi feito
// e o progresso do dia fica no painel da Tela Inicial.

type RoutineCardProps = {
  routine: RoutineListItem;
  categories?: readonly Category[];
  onOpen: () => void;
  onToggle: () => void;
  /** Toque longo: abre a seleção múltipla (protótipo 3.5). */
  onLongPress: () => void;
  /** "•••": abre o menu de opções da rotina (menu-opcoes.md). */
  onOptions: (anchor: OptionsMenuAnchor | null) => void;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelected: () => void;
};

/** Área do "•••" na janela, a partir do ponto tocado (o alvo tem 48 dp). */
const anchorOf = (event?: GestureResponderEvent): OptionsMenuAnchor | null => {
  const native = event?.nativeEvent;
  if (!native || typeof native.pageX !== "number") return null;
  const half = theme.target.minSize / 2;
  return { x: native.pageX - half, y: native.pageY - half, width: theme.target.minSize, height: theme.target.minSize };
};

/**
 * Card da rotina (protótipo 3 e 3.5): abrir pelo card e concluir o dia pelo círculo, em toques separados;
 * o toque longo seleciona e o "•••" abre Editar e Excluir. Fora dos dias da rotina, o círculo fica
 * desabilitado e o motivo aparece em texto (rotinas.md, R6).
 */
const RoutineCard = ({
  routine,
  categories,
  onOpen,
  onToggle,
  onLongPress,
  onOptions,
  selectionMode,
  selected,
  onToggleSelected,
}: RoutineCardProps) => {
  const hold = useHoldFill();
  const detail = `${taskCountLabel(routine.taskCount)} · ${formatDays(routine.days)}`;
  const inactive = !routine.activeToday;
  const returnText =
    inactive || (routine.doneToday && routine.nextActiveDay !== undefined)
      ? formatRoutineReturn(routine.nextActiveDay)
      : null;
  const openDetail = returnText ? `${detail}, ${returnText}` : detail;
  const body = (
    <>
      <IconTile icon={getRoutineIconSymbol(routine.icon, categories)} />
      <View style={styles.cardText}>
        <Text allowFontScaling style={[styles.cardTitle, routine.doneToday && styles.done]}>
          {routine.title}
        </Text>
        <Text allowFontScaling style={styles.muted}>
          {detail}
        </Text>
        {returnText ? (
          <Text allowFontScaling style={styles.muted}>
            {returnText}
          </Text>
        ) : null}
      </View>
    </>
  );

  if (selectionMode) {
    return (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={formatRoutinesCopy("selection.item", { name: routine.title })}
        accessibilityState={{ checked: selected }}
        aria-checked={selected}
        onPress={onToggleSelected}
        style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.pressed]}
      >
        <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
        <View style={styles.selectionTarget}>
          <View style={[styles.selectionMark, selected && styles.selectionMarkOn]}>
            {selected ? <MaterialSymbol name="check" color={theme.color["on-action"]} size={theme.space.md} /> : null}
          </View>
        </View>
        <View style={styles.cardMain}>{body}</View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, hold.holding && styles.cardHolding]} onLayout={hold.onLayout}>
      <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
      {hold.ready ? (
        <Animated.View pointerEvents="none" style={[styles.holdFill, { transform: [{ translateX: hold.translateX }] }]} />
      ) : null}
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={formatRoutinesCopy("card.open", { name: routine.title, detail: openDetail })}
        accessibilityHint={ROUTINES_COPY["card.hint"]}
        onPress={onOpen}
        onLongPress={onLongPress}
        onPressIn={hold.start}
        onPressOut={hold.end}
        delayLongPress={theme.motion.durationHold}
        style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}
      >
        {body}
      </Pressable>
      <CheckCircle
        checked={routine.doneToday}
        onToggle={onToggle}
        disabled={inactive}
        accessibilityLabel={formatRoutinesCopy(routine.doneToday ? "card.uncomplete" : "card.complete", { name: routine.title })}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={formatRoutinesCopy("card.options", { name: routine.title })}
        accessibilityHint={ROUTINES_COPY["card.options.hint"]}
        onPress={(event?: GestureResponderEvent) => onOptions(anchorOf(event))}
        style={({ pressed }) => [styles.optionsButton, pressed && styles.pressed]}
      >
        <MaterialSymbol name="more_horiz" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
      </Pressable>
    </View>
  );
};

/** Lista de Rotinas (protótipo 3 e 3.4), só de apresentação: estado e ações chegam por props. */
export const RoutinesScreenContent = ({
  visibleRoutines,
  totalCount,
  doneTodayCount,
  query,
  lastDeleted,
  categories,
  loading,
  errorKey,
  setQuery,
  toggleDoneToday,
  undoDelete,
  selectionMode,
  selectedIds,
  pendingDelete,
  startSelection,
  toggleSelected,
  cancelSelection,
  selectAll,
  requestDelete,
  cancelDelete,
  confirmDelete,
  onCreateRoutine,
  onOpenRoutine,
  onEditRoutine,
}: RoutinesScreenContentProps) => {
  const insets = useSafeAreaInsets();
  const [searchFocused, setSearchFocused] = useState(false);
  const searching = query.trim() !== "";
  const selectedCount = selectedIds.length;
  // Menu do "•••" (menu-opcoes.md): uma rotina por vez; a âncora é só posição na tela.
  const [menu, setMenu] = useState<{ id: string; anchor: OptionsMenuAnchor | null } | null>(null);
  const menuRoutine = menu ? visibleRoutines.find((routine) => routine.id === menu.id) : undefined;
  const deleteCount = pendingDelete?.ids.length ?? 0;
  const deleteTasks = pendingDelete?.taskCount ?? 0;

  return (
    <View style={styles.screen}>
      {selectionMode ? (
        <ContextualHeader
          countLabel={selectedCount === 1 ? ROUTINES_COPY["selection.one"] : formatRoutinesCopy("selection.other", { n: selectedCount })}
          onCancel={cancelSelection}
        />
      ) : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: selectionMode ? theme.space.md : insets.top + theme.primitive["space-32"] }]}
      >
        {selectionMode ? null : (
          <>
        <View style={styles.heading}>
          <Text accessibilityRole="header" allowFontScaling style={styles.title}>
            {ROUTINES_COPY.title}
          </Text>
          <Text allowFontScaling style={styles.muted}>
            {ROUTINES_COPY.subtitle}
          </Text>
        </View>

        <View accessibilityRole="search" style={[styles.search, searchFocused && styles.searchFocused]}>
          <MaterialSymbol name="search" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
          <TextInput
            accessibilityLabel={ROUTINES_COPY.search}
            allowFontScaling
            value={query}
            onChangeText={setQuery}
            placeholder={ROUTINES_COPY.search}
            placeholderTextColor={cosmicColors.inactive}
            returnKeyType="search"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={styles.searchInput}
          />
        </View>

        <PrimaryButton
          theme={theme}
          label={ROUTINES_COPY.new}
          icon={<MaterialSymbol name="add" color={theme.button.label} size={theme.navbar.iconSize} />}
          onPress={onCreateRoutine}
        />
          </>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text accessibilityRole="header" allowFontScaling style={styles.sectionTitle}>
              {ROUTINES_COPY.today}
            </Text>
          </View>
          {errorKey ? (
            <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.alert}>
              <MaterialSymbol name="error" filled color={theme.color.error} size={theme.navbar.iconSize} />
              <Text allowFontScaling style={styles.alertText}>
                {ROUTINES_COPY[errorKey]}
              </Text>
            </View>
          ) : null}
          {loading && visibleRoutines.length === 0 ? <SkeletonCards accessibilityLabel={ROUTINES_COPY.loading} /> : null}
          {visibleRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              categories={categories}
              onOpen={() => onOpenRoutine(routine.id)}
              onToggle={() => toggleDoneToday(routine.id)}
              onLongPress={() => startSelection(routine.id)}
              onOptions={(anchor) => setMenu({ id: routine.id, anchor })}
              selectionMode={selectionMode}
              selected={selectedIds.includes(routine.id)}
              onToggleSelected={() => toggleSelected(routine.id)}
            />
          ))}
          {visibleRoutines.length === 0 && !loading ? (
            <EmptyOrbitState
              title={searching ? ROUTINES_COPY["noResults.title"] : ROUTINES_COPY["empty.title"]}
              message={searching ? ROUTINES_COPY["noResults.message"] : ROUTINES_COPY["empty.message"]}
            />
          ) : null}
        </View>
      </ScrollView>

      {selectionMode ? (
        <ContextualActionBar
          actions={[
            { id: "all", label: ROUTINES_COPY["selection.selectAll"], icon: "done_all", onPress: selectAll },
            {
              id: "delete",
              label: formatRoutinesCopy("selection.delete", { n: selectedCount }),
              icon: "delete_outline",
              onPress: () => requestDelete(),
              destructive: true,
              disabled: selectedCount === 0,
            },
          ]}
        />
      ) : null}

      <OptionsMenu
        visible={menuRoutine !== undefined}
        anchor={menu?.anchor ?? null}
        accessibilityLabel={menuRoutine ? formatRoutinesCopy("card.options", { name: menuRoutine.title }) : ""}
        onClose={() => setMenu(null)}
        items={
          menuRoutine
            ? [
                { id: "edit", label: ROUTINES_COPY["menu.edit"], icon: "edit", onPress: () => onEditRoutine?.(menuRoutine.id) },
                {
                  id: "delete",
                  label: ROUTINES_COPY["menu.delete"],
                  icon: "delete_outline",
                  destructive: true,
                  onPress: () => requestDelete([menuRoutine.id]),
                },
              ]
            : []
        }
      />

      <ConfirmDialog
        visible={pendingDelete !== null}
        icon="delete_outline"
        title={
          deleteCount === 1
            ? formatRoutinesCopy("delete.title", { name: pendingDelete?.title ?? "" })
            : formatRoutinesCopy("delete.title.many", { n: deleteCount })
        }
        message={
          deleteCount === 1
            ? deleteTasks === 1
              ? ROUTINES_COPY["delete.message.one"]
              : formatRoutinesCopy("delete.message.other", { n: deleteTasks })
            : formatRoutinesCopy("delete.message.many", { n: deleteTasks })
        }
        cancelLabel={ROUTINES_COPY["delete.cancel"]}
        confirmLabel={deleteCount === 1 ? ROUTINES_COPY["delete.confirm"] : formatRoutinesCopy("selection.delete", { n: deleteCount })}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      >
        <View style={styles.note}>
          <MaterialSymbol name="auto_awesome" filled color={cosmicColors.focus} size={theme.navbar.iconSize} />
          <Text allowFontScaling style={styles.noteText}>
            {ROUTINES_COPY["delete.note"]}
          </Text>
        </View>
      </ConfirmDialog>

      {lastDeleted ? (
        <View style={styles.snackbar}>
          <Snackbar
            message={formatRoutinesCopy("deleted.message", { name: lastDeleted.title })}
            actionLabel={ROUTINES_COPY["deleted.undo"]}
            onAction={undoDelete}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface },
  scroll: { flex: 1 },
  content: { gap: theme.space.md, paddingHorizontal: theme.space.md, paddingBottom: theme.space.lg },
  heading: { gap: theme.primitive["space-4"] },
  title: { ...theme.font.title, color: theme.color["on-surface"] },
  muted: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
  centered: { textAlign: "center" },
  search: {
    minHeight: theme.target.minSize,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.navbar.bg,
  },
  searchFocused: { borderWidth: theme.focus.ringWidth, borderColor: theme.color.focus },
  searchInput: { ...theme.font.body, flex: 1, minWidth: 0, minHeight: theme.target.minSize, color: theme.color["on-surface"] },
  section: { gap: theme.space.sm },
  sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: theme.space.sm },
  sectionTitle: { ...theme.font["card-title"], color: theme.color["on-surface"] },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.primitive["space-4"],
    padding: theme.space.sm,
    paddingRight: theme.primitive["space-4"],
    borderRadius: theme.radius.lg,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.card,
    backgroundColor: cosmicColors.card,
    overflow: "hidden",
  },
  cardSelected: { borderColor: theme.color.action, borderWidth: theme.focus.ringWidth },
  cardHolding: { borderColor: theme.color.action },
  holdFill: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: theme.color["action-subtle"] },
  optionsButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.target.minSize,
    minWidth: theme.target.minSize,
    borderRadius: theme.radius.md,
  },
  selectionTarget: { width: theme.target.minSize, height: theme.target.minSize, alignItems: "center", justifyContent: "center" },
  // Marca igual ao CheckCircle (circulo-concluir.md, "Marca de seleção").
  selectionMark: {
    width: theme.navbar.iconSize,
    height: theme.navbar.iconSize,
    borderRadius: theme.navbar.iconSize / 2,
    borderWidth: theme.focus.ringWidth,
    borderColor: theme.color.action,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionMarkOn: { backgroundColor: theme.color.action },
  note: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  noteText: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"], flex: 1 },
  cardMain: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: theme.space.md, borderRadius: theme.radius.md },
  cardText: { flex: 1, minWidth: 0 },
  cardTitle: { ...theme.font["card-title"], color: theme.color["on-surface"] },
  done: { textDecorationLine: "line-through" },
  pressed: { opacity: theme.motion.opacityPressed },
  snackbar: { position: "absolute", left: theme.space.md, right: theme.space.md, bottom: theme.space.md },
  // Erro com ícone em color.error e texto em color.on-surface (05-padroes.md, F4/F7; WCAG 1.4.1).
  alert: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  alertText: { ...theme.font.label, color: theme.color["on-surface"], flex: 1 },
});
