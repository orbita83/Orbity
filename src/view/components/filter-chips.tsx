import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { themes, type OrbityTheme } from "../theme/tokens";

export type TaskFilter = "all" | "pending" | "completed";

export type FilterChipOption<T extends string = string> = {
  id: T;
  label: string;
};

export const DEFAULT_TASK_FILTERS: readonly FilterChipOption<TaskFilter>[] = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendentes" },
  { id: "completed", label: "Concluídas" },
] as const;

export type FilterChipItemProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme?: OrbityTheme;
  disabled?: boolean;
};

export const FilterChipItem = ({
  label,
  selected,
  onPress,
  theme = themes.light,
  disabled = false,
}: FilterChipItemProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const styles = createChipStyles(theme, selected, isFocused);

  return (
    <View style={styles.focusContainer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filtrar por ${label}`}
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={onPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          styles.chip,
          pressed && styles.chipPressed,
        ]}
      >
        <Text allowFontScaling style={styles.label}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
};

export type FilterChipsProps<T extends string = TaskFilter> = {
  selectedFilter: T;
  onSelectFilter: (filterId: T) => void;
  filters?: readonly FilterChipOption<T>[];
  theme?: OrbityTheme;
  accessibilityLabel?: string;
};

export const FilterChips = <T extends string = TaskFilter>({
  selectedFilter,
  onSelectFilter,
  filters = DEFAULT_TASK_FILTERS as unknown as readonly FilterChipOption<T>[],
  theme = themes.light,
  accessibilityLabel = "Filtros de tarefas",
}: FilterChipsProps<T>) => {
  const styles = createContainerStyles(theme);

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={styles.container}
    >
      {filters.map((filter) => (
        <FilterChipItem
          key={filter.id}
          label={filter.label}
          selected={filter.id === selectedFilter}
          onPress={() => onSelectFilter(filter.id)}
          theme={theme}
        />
      ))}
    </View>
  );
};

const createChipStyles = (
  theme: OrbityTheme,
  selected: boolean,
  isFocused: boolean,
) =>
  StyleSheet.create({
    focusContainer: {
      borderColor: theme.color.focus,
      borderRadius:
        theme.radius.md +
        theme.focus.ringOffset +
        theme.focus.ringWidth,
      borderWidth: isFocused ? theme.focus.ringWidth : 0,
      padding: isFocused
        ? theme.focus.ringOffset
        : theme.focus.ringOffset + theme.focus.ringWidth,
    },
    chip: {
      alignItems: "center",
      backgroundColor: selected ? theme.color.action : theme.color.surface,
      borderColor: theme.color.action,
      borderRadius: theme.radius.md,
      borderWidth: theme.focus.ringWidth,
      justifyContent: "center",
      minHeight: theme.target.minSize,
      minWidth: theme.target.minSize,
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.sm,
    },
    chipPressed: {
      opacity: 0.85,
    },
    label: {
      ...theme.font.label,
      color: selected ? theme.color["on-action"] : theme.color["on-surface"],
      fontWeight: selected ? "700" : "500",
      textAlign: "center",
    },
  });

const createContainerStyles = (theme: OrbityTheme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.space.sm,
    },
  });
