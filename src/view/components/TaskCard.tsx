import { Pressable, StyleSheet, Text, View } from "react-native";
import { cosmicBorders, cosmicColors, cosmicGradients, themes, type OrbityTheme } from "../theme/tokens";
import { CheckCircle } from "./CheckCircle";
import { CategoryTag } from "./CategoryTag";
import { GradientSurface } from "./GradientSurface";
import { MaterialSymbol, type MaterialSymbolName } from "./MaterialSymbol";

/** Categoria já pronta para exibir: o chamador converte o id em rótulo e ícone. */
export type TaskCardCategory = {
  label: string;
  symbol: MaterialSymbolName;
};

export type TaskCardProps = {
  title: string;
  dueDate?: string;
  /** Categoria de estudo, mostrada como tag antes do prazo (tag-categoria.md). */
  category?: TaskCardCategory;
  completed: boolean;
  onToggleCompleted: () => void;
  onOptionsPress?: () => void;
  /** Toque longo no texto da tarefa: abre a seleção múltipla (padrão F6). */
  onLongPress?: () => void;
  /** Tarefa fixada no topo da lista. */
  pinned?: boolean;
  /** Modo de seleção múltipla: o card inteiro alterna a seleção. */
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelected?: () => void;
  theme?: OrbityTheme;
};

export const TaskCard = ({
  title,
  dueDate,
  category,
  completed,
  onToggleCompleted,
  onOptionsPress,
  onLongPress,
  pinned = false,
  selectionMode = false,
  selected = false,
  onToggleSelected,
  theme = themes.cosmic,
}: TaskCardProps) => {
  const styles = createStyles(theme, completed);
  const cosmic = Boolean(theme.componentOverrides?.cardSurface);
  const content = (
    <View style={styles.content}>
      <View style={styles.titleRow}>
        {pinned ? <MaterialSymbol name="push_pin" filled color={cosmicColors.focus} size={theme.space.md} /> : null}
        <Text allowFontScaling style={styles.title}>
          {title}
        </Text>
      </View>
      {category || dueDate ? (
        <View style={styles.meta}>
          {category ? <CategoryTag label={category.label} symbol={category.symbol} theme={theme} /> : null}
          {dueDate ? (
            <Text allowFontScaling style={styles.dueDate}>
              {dueDate}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  if (selectionMode) {
    return (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`Selecionar tarefa: ${title}`}
        accessibilityState={{ checked: selected }}
        aria-checked={selected}
        onPress={onToggleSelected}
        style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.pressed]}
      >
        {cosmic && !selected ? <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} /> : null}
        <View style={styles.selectionTarget}>
          <View style={[styles.selectionMark, selected && styles.selectionMarkOn]}>
            {selected ? <MaterialSymbol name="check" color={theme.color.surface} size={theme.space.md} /> : null}
          </View>
        </View>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      {cosmic ? <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} /> : null}
      <CheckCircle
        checked={completed}
        onToggle={onToggleCompleted}
        accessibilityLabel={`${completed ? "Desmarcar" : "Concluir"} tarefa: ${title}`}
      />
      <Pressable
        accessible={Boolean(onLongPress)}
        accessibilityHint={onLongPress ? "Toque longo para selecionar várias tarefas" : undefined}
        onLongPress={onLongPress}
        disabled={!onLongPress}
        style={styles.contentPressable}
      >
        {content}
      </Pressable>
      {onOptionsPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Opções da tarefa: ${title}`}
          onPress={onOptionsPress}
          style={({ pressed }) => [styles.optionsButton, pressed && styles.pressed]}
        >
          <MaterialSymbol name="more_horiz" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
        </Pressable>
      ) : null}
    </View>
  );
};

const createStyles = (theme: OrbityTheme, completed: boolean) =>
  StyleSheet.create({
    card: {
      alignItems: "center",
      backgroundColor: theme.componentOverrides?.cardSurface ?? theme.color.surface,
      borderColor: theme.componentOverrides?.cardSurface ? cosmicBorders.card : theme.color["border-subtle"],
      borderRadius: theme.radius.lg,
      borderWidth: theme.border.widthThin,
      flexDirection: "row",
      gap: theme.primitive["space-4"],
      overflow: "hidden",
      paddingHorizontal: theme.primitive["space-4"],
      paddingVertical: theme.space.sm,
    },
    cardSelected: {
      backgroundColor: theme.color["action-subtle"],
      borderColor: theme.color.focus,
      borderWidth: theme.focus.ringWidth,
    },
    pressed: { opacity: theme.motion.opacityPressed },
    contentPressable: { flex: 1, minWidth: 0 },
    content: { flex: 1, gap: theme.primitive["space-4"], minWidth: 0, paddingVertical: theme.primitive["space-4"] },
    // Tag e prazo na mesma linha; com texto ampliado, quebram em vez de truncar (tag-categoria.md).
    meta: {
      alignItems: "center",
      columnGap: theme.space.sm,
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: theme.primitive["space-4"],
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: theme.primitive["space-4"] },
    title: {
      ...theme.font.body,
      color: theme.color["on-surface"],
      flexShrink: 1,
      textDecorationLine: completed ? "line-through" : "none",
    },
    dueDate: { ...theme.font.label, color: theme.color["on-surface-variant"] },
    optionsButton: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: theme.target.minSize,
      minWidth: theme.target.minSize,
      borderRadius: theme.radius.md,
    },
    selectionTarget: {
      width: theme.target.minSize,
      height: theme.target.minSize,
      alignItems: "center",
      justifyContent: "center",
    },
    selectionMark: {
      width: theme.navbar.iconSize,
      height: theme.navbar.iconSize,
      borderRadius: theme.navbar.iconSize / 2,
      borderWidth: theme.focus.ringWidth,
      borderColor: cosmicColors.inactive,
      alignItems: "center",
      justifyContent: "center",
    },
    selectionMarkOn: { backgroundColor: theme.color.focus, borderColor: theme.color.focus },
  });
