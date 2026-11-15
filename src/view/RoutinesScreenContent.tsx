import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RoutineListItem, RoutinesActions, RoutinesState } from "../viewmodel/RoutinesViewModel";
import { CheckCircle } from "./components/CheckCircle";
import { IconTile } from "./components/IconTile";
import { MaterialSymbol } from "./components/material-symbol";
import { PrimaryButton } from "./components/primary-button";
import { Snackbar } from "./components/Snackbar";
import { ROUTINES_COPY, formatDays, formatRoutinesCopy, taskCountLabel } from "./routines-copy";
import { cosmicBorders, cosmicColors, cosmicGradients, themes } from "./theme/tokens";
import { GradientSurface } from "./components/GradientSurface";

const theme = themes.cosmic;

export type RoutinesScreenContentProps = RoutinesState &
  RoutinesActions & {
    onCreateRoutine: () => void;
    onOpenRoutine: (id: string) => void;
  };

const summaryOf = (done: number, total: number) => {
  if (total === 0) return ROUTINES_COPY["summary.empty"];
  return done === total ? ROUTINES_COPY["summary.allDone"] : formatRoutinesCopy("summary.progress", { done, total });
};

type RoutineCardProps = {
  routine: RoutineListItem;
  onOpen: () => void;
  onToggle: () => void;
};

/** Card da rotina (protótipo 3): abrir pelo card e concluir o dia pelo círculo, em toques separados. */
const RoutineCard = ({ routine, onOpen, onToggle }: RoutineCardProps) => {
  const detail = `${taskCountLabel(routine.taskCount)} · ${formatDays(routine.days)}`;
  return (
    <View style={styles.card}>
      <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={formatRoutinesCopy("card.open", { name: routine.title, detail })}
        onPress={onOpen}
        style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}
      >
        <IconTile icon={routine.icon} />
        <View style={styles.cardText}>
          <Text allowFontScaling style={[styles.cardTitle, routine.doneToday && styles.done]}>
            {routine.title}
          </Text>
          <Text allowFontScaling style={styles.muted}>
            {detail}
          </Text>
        </View>
      </Pressable>
      <CheckCircle
        checked={routine.doneToday}
        onToggle={onToggle}
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
            <Text allowFontScaling style={styles.muted}>
              {summaryOf(doneTodayCount, totalCount)}
            </Text>
          </View>
          {visibleRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onOpen={() => onOpenRoutine(routine.id)}
              onToggle={() => toggleDoneToday(routine.id)}
            />
          ))}
          {visibleRoutines.length === 0 ? (
            <View style={styles.empty}>
              <Text allowFontScaling style={styles.emptyTitle}>
                {searching ? ROUTINES_COPY["noResults.title"] : ROUTINES_COPY["empty.title"]}
              </Text>
              <Text allowFontScaling style={[styles.muted, styles.centered]}>
                {searching ? ROUTINES_COPY["noResults.message"] : ROUTINES_COPY["empty.message"]}
              </Text>
            </View>
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
  empty: {
    alignItems: "center",
    gap: theme.primitive["space-4"],
    paddingVertical: theme.primitive["space-32"],
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.lg,
    borderWidth: theme.border.widthThin,
    borderStyle: "dashed",
    borderColor: cosmicBorders.sheet,
  },
  emptyTitle: { ...theme.font["card-title"], color: theme.color["on-surface"], textAlign: "center" },
  snackbar: { position: "absolute", left: theme.space.md, right: theme.space.md, bottom: theme.space.md },
});
