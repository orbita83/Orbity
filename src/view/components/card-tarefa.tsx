import { Pressable, StyleSheet, Text, View } from "react-native";
import { themes, type OrbityTheme } from "../theme/tokens";

export type CardTarefaProps = {
  title: string;
  dueDate?: string;
  completed: boolean;
  onToggleCompleted: () => void;
  onOptionsPress?: () => void;
  theme?: OrbityTheme;
};

export const CardTarefa = ({
  title,
  dueDate,
  completed,
  onToggleCompleted,
  onOptionsPress,
  theme = themes.light,
}: CardTarefaProps) => {
  const styles = createStyles(theme, completed);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`${completed ? "Desmarcar" : "Concluir"} tarefa: ${title}`}
        accessibilityState={{ checked: completed }}
        onPress={onToggleCompleted}
        style={styles.checkbox}
      >
        <View
          style={[
            styles.checkboxVisual,
            completed && styles.checkboxCompleted,
          ]}
        >
          {completed ? (
            <Text allowFontScaling style={styles.checkboxLabel}>
              ✓
            </Text>
          ) : null}
        </View>
      </Pressable>
      <View style={styles.content}>
        <Text allowFontScaling style={styles.title}>
          {title}
        </Text>
        {dueDate ? (
          <Text allowFontScaling style={styles.dueDate}>
            {dueDate}
          </Text>
        ) : null}
      </View>
      {onOptionsPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Opções da tarefa: ${title}`}
          onPress={onOptionsPress}
          style={styles.optionsButton}
        >
          <Text allowFontScaling style={styles.optionsLabel}>…</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const createStyles = (theme: OrbityTheme, completed: boolean) =>
  StyleSheet.create({
    card: {
      alignItems: "center",
      backgroundColor: theme.color.surface,
      borderRadius: theme.radius.lg,
      elevation: theme.elevation.card,
      flexDirection: "row",
      padding: theme.space.md,
    },
    checkbox: {
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.space.md,
      minHeight: theme.target.minSize,
      minWidth: theme.target.minSize,
      width: theme.target.minSize,
    },
    checkboxVisual: {
      alignItems: "center",
      backgroundColor: theme.color.surface,
      borderColor: theme.color.action,
      borderRadius: theme.radius.md,
      borderWidth: theme.focus.ringWidth,
      height: theme.primitive["space-24"],
      justifyContent: "center",
      width: theme.primitive["space-24"],
    },
    checkboxCompleted: { backgroundColor: theme.color.action },
    checkboxLabel: {
      ...theme.font.label,
      color: theme.color.surface,
      textAlign: "center",
    },
    content: { flex: 1, flexShrink: 1 },
    title: {
      ...theme.font.body,
      color: theme.color["on-surface"],
      flexShrink: 1,
      textDecorationLine: completed ? "line-through" : "none",
    },
    dueDate: {
      ...theme.font.label,
      color: theme.color["on-surface"],
      marginTop: theme.space.sm,
    },
    optionsButton: {
      alignItems: "center",
      justifyContent: "center",
      marginLeft: theme.space.sm,
      minHeight: theme.target.minSize,
      minWidth: theme.target.minSize,
    },
    optionsLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  });
