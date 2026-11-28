import { useState } from "react";
import { Animated, Easing, type GestureResponderEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { cosmicBorders, cosmicColors, cosmicGradients, themes, type OrbityTheme } from "../theme/tokens";
import { useReduceMotion } from "../theme/useReduceMotion";
import { CheckCircle } from "./CheckCircle";
import { CategoryTag } from "./CategoryTag";
import { GradientSurface } from "./GradientSurface";
import { MaterialSymbol, type MaterialSymbolName } from "./MaterialSymbol";
import type { OptionsMenuAnchor } from "./OptionsMenu";

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
  /** "•••": abre o menu de opções da tarefa (menu-opcoes.md), ancorado ao ponto tocado. */
  onOptionsPress?: (anchor: OptionsMenuAnchor | null) => void;
  /** Toque simples no card: abre o detalhe da tarefa (protótipo 2.4). */
  onPress?: () => void;
  /** Toque longo no card: abre a seleção múltipla (padrão F6). */
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
  onPress,
  onLongPress,
  pinned = false,
  selectionMode = false,
  selected = false,
  onToggleSelected,
  theme = themes.cosmic,
}: TaskCardProps) => {
  const styles = createStyles(theme, completed);
  const cosmic = Boolean(theme.componentOverrides?.cardSurface);
  const reduceMotion = useReduceMotion();
  // Preenchimento do toque longo (ODS 1.3, fill-on-hold): cresce da esquerda para a direita
  // durante motion.duration.hold; ao soltar antes, volta em motion.duration.short.
  const [hold] = useState(() => new Animated.Value(0));
  const [holding, setHolding] = useState(false);
  const [width, setWidth] = useState(0);
  const startHold = () => {
    setHolding(true);
    if (reduceMotion) return;
    Animated.timing(hold, { toValue: 1, duration: theme.motion.durationHold, easing: Easing.linear, useNativeDriver: true }).start();
  };
  const endHold = () => {
    setHolding(false);
    if (reduceMotion) return;
    Animated.timing(hold, { toValue: 0, duration: theme.motion.durationShort, useNativeDriver: true }).start();
  };

  // Com toque longo, o conteúdo vira um único elemento acessível e o VoiceOver
  // ignora o rótulo próprio da tag; por isso o rótulo do grupo repete "Categoria: …".
  const contentLabel = [title, category ? `Categoria: ${category.label}` : null, dueDate ?? null]
    .filter(Boolean)
    .join(", ");
  const content = (
    <View style={styles.content}>
      <Text allowFontScaling style={styles.title}>
        {title}
      </Text>
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
        {/* ODS 1.3: o card selecionado mantém o fundo normal; o destaque é a borda de 2 dp em color.action. */}
        {cosmic ? <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} /> : null}
        <View style={styles.selectionTarget}>
          <View style={[styles.selectionMark, selected && styles.selectionMarkOn]}>
            {selected ? <MaterialSymbol name="check" color={theme.color["on-action"]} size={theme.space.md} /> : null}
          </View>
        </View>
        {content}
      </Pressable>
    );
  }

  const fillTranslate = hold.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] });

  return (
    <View style={[styles.card, holding && styles.cardHolding]} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {cosmic ? <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} /> : null}
      {width > 0 ? (
        <Animated.View pointerEvents="none" style={[styles.holdFill, { transform: [{ translateX: fillTranslate }] }]} />
      ) : null}
      <CheckCircle
        checked={completed}
        onToggle={onToggleCompleted}
        accessibilityLabel={`${completed ? "Desmarcar" : "Concluir"} tarefa: ${title}`}
      />
      <Pressable
        accessible={Boolean(onPress || onLongPress)}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={onPress || onLongPress ? contentLabel : undefined}
        accessibilityHint={
          onPress
            ? "Abre a tarefa. Toque longo para selecionar várias tarefas"
            : onLongPress
              ? "Toque longo para selecionar várias tarefas"
              : undefined
        }
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={onLongPress ? startHold : undefined}
        onPressOut={onLongPress ? endHold : undefined}
        delayLongPress={theme.motion.durationHold}
        disabled={!onPress && !onLongPress}
        style={styles.contentPressable}
      >
        {content}
      </Pressable>
      {/* ODS 1.3: o alfinete fica no fim do card, antes do "•••", sem empurrar o título. */}
      {pinned ? (
        <View accessible accessibilityRole="image" accessibilityLabel="Fixada" style={styles.pin}>
          <MaterialSymbol name="push_pin" filled color={theme.color["on-surface-variant"]} size={theme.space.md} />
        </View>
      ) : null}
      {onOptionsPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Opções da tarefa: ${title}`}
          accessibilityHint="Abre o menu com Editar, Fixar e Excluir"
          onPress={(event?: GestureResponderEvent) => onOptionsPress(anchorOf(event, theme.target.minSize))}
          style={({ pressed }) => [styles.optionsButton, pressed && styles.pressed]}
        >
          <MaterialSymbol name="more_horiz" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
        </Pressable>
      ) : null}
    </View>
  );
};

/** Área do "•••" na janela, a partir do ponto tocado (o alvo tem 48 dp). */
const anchorOf = (event: GestureResponderEvent | undefined, target: number): OptionsMenuAnchor | null => {
  const native = event?.nativeEvent;
  if (!native || typeof native.pageX !== "number") return null;
  return { x: native.pageX - target / 2, y: native.pageY - target / 2, width: target, height: target };
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
      borderColor: theme.color.action,
      borderWidth: theme.focus.ringWidth,
    },
    cardHolding: { borderColor: theme.color.action },
    holdFill: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: theme.color["action-subtle"],
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
    title: {
      ...theme.font.body,
      color: theme.color["on-surface"],
      flexShrink: 1,
      textDecorationLine: completed ? "line-through" : "none",
    },
    dueDate: { ...theme.font.label, color: theme.color["on-surface-variant"] },
    pin: { justifyContent: "center", minHeight: theme.target.minSize },
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
  });
