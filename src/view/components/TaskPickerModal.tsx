import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { cosmicBorders, themes } from "../theme/tokens";
import { MaterialSymbol, type MaterialSymbolName } from "./material-symbol";

const theme = themes.cosmic;
const LIST_MAX_HEIGHT = theme.target.minSize * 6 + theme.space.sm * 5;

export type TaskPickerModalOption = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
  readonly icon?: MaterialSymbolName;
};

export type TaskPickerModalProps = {
  visible: boolean;
  title: string;
  closeLabel: string;
  options: readonly TaskPickerModalOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

/** Modal acessível de seleção única (ODS modal.md): data, horário e categoria em Nova tarefa. */
export const TaskPickerModal = ({
  visible,
  title,
  closeLabel,
  options,
  selectedValue,
  onSelect,
  onClose,
}: TaskPickerModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
    <View style={styles.scrim}>
      <View accessibilityViewIsModal aria-modal style={styles.surface}>
        <View style={styles.header}>
          <Text accessibilityRole="header" allowFontScaling style={styles.title}>
            {title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <MaterialSymbol name="close" color={theme.color["on-surface-variant"]} size={theme.navbar.iconSize} />
          </Pressable>
        </View>

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          <View accessibilityRole="radiogroup" accessibilityLabel={title} style={styles.radioGroup}>
            {options.map((option) => {
              const selected = option.value === selectedValue;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityLabel={option.hint ? `${option.label}, ${option.hint}` : option.label}
                  accessibilityState={{ checked: selected }}
                  aria-checked={selected}
                  onPress={() => onSelect(option.value)}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  {option.icon ? (
                    <MaterialSymbol
                      name={option.icon}
                      filled={selected}
                      color={selected ? theme.color.focus : theme.color["on-surface-variant"]}
                      size={theme.navbar.iconSize}
                    />
                  ) : null}
                  <View style={styles.optionText}>
                    <Text allowFontScaling style={styles.optionLabel}>
                      {option.label}
                    </Text>
                    {option.hint ? (
                      <Text allowFontScaling style={styles.optionHint}>
                        {option.hint}
                      </Text>
                    ) : null}
                  </View>
                  {selected ? (
                    <MaterialSymbol name="check" color={theme.color.focus} size={theme.navbar.iconSize} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space.lg,
    backgroundColor: theme.color.scrim,
  },
  surface: {
    width: "100%",
    maxWidth: 420,
    gap: theme.space.sm,
    padding: theme.space.lg,
    borderRadius: theme.radius.xl,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.color["surface-variant"],
    boxShadow: theme.shadow.sheet,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.sm,
  },
  title: {
    ...theme.font["card-title"],
    color: theme.color["on-surface"],
    flex: 1,
  },
  closeButton: {
    width: theme.target.minSize,
    height: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
  },
  list: {
    maxHeight: LIST_MAX_HEIGHT,
  },
  listContent: {
    paddingVertical: theme.primitive["space-4"],
  },
  radioGroup: {
    gap: theme.space.sm,
  },
  option: {
    minHeight: theme.target.minSize,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-subtle"],
    backgroundColor: theme.color.surface,
  },
  optionSelected: {
    borderWidth: theme.focus.ringWidth,
    borderColor: theme.color.focus,
    backgroundColor: theme.color["action-subtle"],
  },
  optionText: {
    flex: 1,
    minWidth: 0,
    gap: theme.primitive["space-4"],
  },
  optionLabel: {
    ...theme.font.body,
    color: theme.color["on-surface"],
  },
  optionHint: {
    ...theme.font["body-sm"],
    color: theme.color["on-surface-variant"],
  },
  pressed: {
    opacity: theme.motion.opacityPressed,
  },
});
