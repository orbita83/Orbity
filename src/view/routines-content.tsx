import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Category } from "@/model/entities/category";
import type { RoutineListItem, RoutinesActions, RoutinesState } from "../viewmodel/useRoutinesViewModel";
import { CheckCircle } from "./components/CheckCircle";
import { IconTile } from "./components/IconTile";
import { EmptyOrbitState } from "./components/EmptyOrbitState";
import { MaterialSymbol } from "./components/MaterialSymbol";
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

const theme = themes.cosmic;

export type RoutinesScreenContentProps = RoutinesState &
  Omit<RoutinesActions, "handleCreateRoutine" | "handleOpenRoutine"> & {
    onCreateRoutine: () => void;
    onOpenRoutine: (id: string) => void;
  };

// ODS 1.3: o resumo ao lado de "Hoje" sai; o CheckCircle de cada card já mostra o que foi feito
// e o progresso do dia fica no painel da Tela Inicial.

type RoutineCardProps = {
  routine: RoutineListItem;
  categories?: readonly Category[];
  onOpen: () => void;
  onToggle: () => void;
};

/**
 * Card da rotina (protótipo 3): abrir pelo card e concluir o dia pelo círculo, em toques separados.
 * Fora dos dias da rotina, o círculo fica desabilitado e o motivo aparece em texto (rotinas.md, R6).
 */
const RoutineCard = ({ routine, categories, onOpen, onToggle }: RoutineCardProps) => {
  const detail = `${taskCountLabel(routine.taskCount)} · ${formatDays(routine.days)}`;
  const inactive = !routine.activeToday;
  const returnText =
    inactive || (routine.doneToday && routine.nextActiveDay !== undefined)
      ? formatRoutineReturn(routine.nextActiveDay)
      : null;
  const openDetail = returnText ? `${detail}, ${returnText}` : detail;
  return (
    <View style={styles.card}>
      <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={formatRoutinesCopy("card.open", { name: routine.title, detail: openDetail })}
        onPress={onOpen}
        style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}
      >
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
      </Pressable>
      <CheckCircle
        checked={routine.doneToday}
        onToggle={onToggle}
        disabled={inactive}
        accessibilityLabel={formatRoutinesCopy(routine.doneToday ? "card.uncomplete" : "card.complete", { name: routine.title })}
      />
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
  onCreateRoutine,
  onOpenRoutine,
}: RoutinesScreenContentProps) => {
  const insets = useSafeAreaInsets();
  const [searchFocused, setSearchFocused] = useState(false);
  const searching = query.trim() !== "";

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.primitive["space-32"] }]}>
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
