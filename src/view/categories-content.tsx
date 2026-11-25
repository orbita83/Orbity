import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Category, CategoryIconId } from "@/model/entities/category";
import {
  CATEGORY_ICON_IDS,
  CATEGORY_NAME_MAX_LENGTH,
  type CategoriesActions,
  type CategoriesState,
} from "@/viewmodel/useCategoriesViewModel";
import {
  CATEGORIES_COPY,
  CATEGORY_ICON_LABELS,
  CATEGORY_ICON_SYMBOLS,
  formatCategoriesCopy,
  getCategoryLabel,
  getCategorySymbol,
} from "./categoryCopy";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { GradientSurface } from "./components/GradientSurface";
import { IconTile } from "./components/IconTile";
import { MaterialSymbol } from "./components/MaterialSymbol";
import { PrimaryButton } from "./components/PrimaryButton";
import { ScreenHeader } from "./components/ScreenHeader";
import { SkeletonCards } from "./components/SkeletonCards";
import { TextField } from "./components/TextField";
import { cosmicBorders, cosmicColors, cosmicGradients, themes } from "./theme/tokens";

const theme = themes.cosmic;

export type CategoriesScreenContentProps = CategoriesState &
  Omit<CategoriesActions, "handleReturnToProfile"> & {
    onReturn: () => void;
  };

type CategoryRowProps = {
  readonly category: Category;
  readonly onEdit: (category: Category, currentLabel: string) => void;
  readonly onDelete: (category: Category) => void;
};

const CategoryRow = ({ category, onEdit, onDelete }: CategoryRowProps) => {
  const label = getCategoryLabel(category.id, category.name);
  const symbol = getCategorySymbol(category.icon);

  return (
    <View style={styles.card}>
      <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
      <View style={styles.cardMain}>
        <IconTile icon={symbol} />
        <View style={styles.cardText}>
          <Text allowFontScaling style={styles.cardTitle}>
            {label}
          </Text>
          <Text allowFontScaling style={styles.cardMeta}>
            {category.isDefault ? CATEGORIES_COPY["card.defaultBadge"] : CATEGORIES_COPY["card.customBadge"]}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={formatCategoriesCopy("card.edit", { name: label })}
          onPress={() => onEdit(category, label)}
          style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}
        >
          <MaterialSymbol name="edit" color={theme.color["on-surface"]} size={theme.navbar.iconSize} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={formatCategoriesCopy("card.delete", { name: label })}
          onPress={() => onDelete(category)}
          style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}
        >
          <MaterialSymbol name="delete_outline" color={theme.color.error} size={theme.navbar.iconSize} />
        </Pressable>
      </View>
    </View>
  );
};

/**
 * Tela de gerenciamento de categorias (Perfil → Categorias, RF-0020, UC-0015, FL-0015, issue #213).
 * Permite listar, criar, renomear, trocar ícone e excluir categorias com confirmação acolhedora.
 */
export const CategoriesScreenContent = ({
  categories,
  loading,
  errorKey,
  formVisible,
  editingId,
  nameInput,
  selectedIcon,
  nameError,
  submitting,
  deletingCategory,
  onReturn,
  reload,
  openCreate,
  openEdit,
  closeForm,
  setNameInput,
  selectIcon,
  submitForm,
  requestDelete,
  cancelDelete,
  confirmDelete,
}: CategoriesScreenContentProps) => {
  const insets = useSafeAreaInsets();
  const isEditing = editingId !== null;
  const deletingName = deletingCategory
    ? getCategoryLabel(deletingCategory.id, deletingCategory.name)
    : "";

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={CATEGORIES_COPY.title}
        backLabel={CATEGORIES_COPY.backLabel}
        onBack={onReturn}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.space.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text allowFontScaling style={styles.subtitle}>
          {CATEGORIES_COPY.subtitle}
        </Text>

        <PrimaryButton
          theme={theme}
          label={CATEGORIES_COPY.new}
          icon={<MaterialSymbol name="add" color={theme.button.label} size={theme.navbar.iconSize} />}
          onPress={openCreate}
        />

        {errorKey ? (
          <View style={styles.errorCard}>
            <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.errorHeader}>
              <MaterialSymbol name="error" filled color={theme.color.error} size={theme.navbar.iconSize} />
              <Text allowFontScaling style={styles.errorText}>
                {CATEGORIES_COPY[errorKey]}
              </Text>
            </View>
            <PrimaryButton theme={theme} label={CATEGORIES_COPY["error.retry"]} onPress={() => void reload()} />
          </View>
        ) : null}

        {loading && categories.length === 0 ? (
          <SkeletonCards accessibilityLabel={CATEGORIES_COPY.loading} />
        ) : null}

        <View style={styles.list}>
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onEdit={openEdit}
              onDelete={requestDelete}
            />
          ))}
          {!loading && categories.length === 0 && !errorKey ? (
            <View style={styles.empty}>
              <Text allowFontScaling style={styles.emptyTitle}>
                {CATEGORIES_COPY["empty.title"]}
              </Text>
              <Text allowFontScaling style={[styles.subtitle, styles.centered]}>
                {CATEGORIES_COPY["empty.message"]}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        visible={formVisible}
        transparent
        animationType="fade"
        onRequestClose={submitting ? () => undefined : closeForm}
        statusBarTranslucent
      >
        <KeyboardAvoidingView style={styles.scrim} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View accessibilityViewIsModal aria-modal style={styles.modalSurface}>
            <View style={styles.modalHeader}>
              <Text accessibilityRole="header" allowFontScaling style={styles.modalTitle}>
                {isEditing ? CATEGORIES_COPY["form.editTitle"] : CATEGORIES_COPY["form.createTitle"]}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={CATEGORIES_COPY["form.close"]}
                accessibilityHint={CATEGORIES_COPY["form.closeHint"]}
                disabled={submitting}
                onPress={closeForm}
                style={({ pressed }) => [styles.modalClose, pressed && styles.pressed]}
              >
                <MaterialSymbol name="close" color={theme.color["on-surface"]} size={theme.navbar.iconSize} />
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <TextField
                label={CATEGORIES_COPY["form.name"]}
                requirement="required"
                value={nameInput}
                onChangeText={(value) => setNameInput(value.slice(0, CATEGORY_NAME_MAX_LENGTH))}
                placeholder={CATEGORIES_COPY["form.name.placeholder"]}
                helper={CATEGORIES_COPY["form.name.helper"]}
                error={nameError}
                maxLength={CATEGORY_NAME_MAX_LENGTH}
                onSubmitEditing={submitting ? undefined : () => void submitForm()}
              />
              <Text allowFontScaling style={styles.counter}>
                {nameInput.length}/{CATEGORY_NAME_MAX_LENGTH}
              </Text>
            </View>

            <View style={styles.iconSection}>
              <Text accessibilityRole="header" allowFontScaling style={styles.groupLabel}>
                {CATEGORIES_COPY["form.icon"]}
              </Text>
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel={CATEGORIES_COPY["form.icon"]}
                style={styles.iconGrid}
              >
                {CATEGORY_ICON_IDS.map((iconId: CategoryIconId) => {
                  const selected = iconId === selectedIcon;
                  return (
                    <Pressable
                      key={iconId}
                      accessibilityRole="radio"
                      accessibilityLabel={CATEGORY_ICON_LABELS[iconId]}
                      accessibilityState={{ checked: selected }}
                      aria-checked={selected}
                      onPress={() => selectIcon(iconId)}
                      style={({ pressed }) => [
                        styles.iconOption,
                        selected && styles.iconOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <MaterialSymbol
                        name={CATEGORY_ICON_SYMBOLS[iconId]}
                        filled
                        color={selected ? theme.color["on-action"] : cosmicColors.focus}
                        size={theme.navbar.iconSize}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalActions}>
              <PrimaryButton
                theme={theme}
                label={submitting ? CATEGORIES_COPY["form.saving"] : CATEGORIES_COPY["form.save"]}
                disabled={submitting}
                busy={submitting}
                onPress={() => void submitForm()}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={CATEGORIES_COPY["form.cancel"]}
                disabled={submitting}
                onPress={closeForm}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text allowFontScaling style={styles.secondaryLabel}>
                  {CATEGORIES_COPY["form.cancel"]}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmDialog
        visible={deletingCategory !== null}
        icon="delete_outline"
        title={formatCategoriesCopy("delete.title", { name: deletingName })}
        message={CATEGORIES_COPY["delete.message"]}
        cancelLabel={CATEGORIES_COPY["delete.cancel"]}
        confirmLabel={CATEGORIES_COPY["delete.confirm"]}
        onCancel={cancelDelete}
        onConfirm={() => void confirmDelete()}
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
    paddingTop: theme.space.sm,
  },
  subtitle: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
  centered: { textAlign: "center" },
  list: { gap: theme.space.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.sm,
    padding: theme.space.sm,
    borderRadius: theme.radius.lg,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.card,
    backgroundColor: cosmicColors.card,
    overflow: "hidden",
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
  },
  cardText: { flex: 1, minWidth: 0, gap: theme.primitive["space-4"] },
  cardTitle: { ...theme.font["card-title"], color: theme.color["on-surface"] },
  cardMeta: { ...theme.font.caption, color: theme.color["on-surface-variant"] },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  actionIcon: {
    minWidth: theme.target.minSize,
    minHeight: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.navbar.bg,
  },
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
  scrim: {
    flex: 1,
    backgroundColor: theme.color.scrim,
    justifyContent: "center",
    padding: theme.space.lg,
  },
  modalSurface: {
    width: "100%",
    gap: theme.space.md,
    padding: theme.space.lg,
    paddingTop: theme.space.sm,
    borderRadius: theme.sheet.radius,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-subtle"],
    backgroundColor: theme.color["surface-variant"],
    boxShadow: theme.shadow.modal,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.sm,
  },
  modalTitle: {
    ...theme.font.title,
    color: theme.color["on-surface"],
    paddingTop: theme.space.sm,
    flex: 1,
  },
  modalClose: {
    width: theme.target.minSize,
    height: theme.target.minSize,
    marginRight: -theme.space.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
  },
  fieldGroup: { gap: theme.primitive["space-4"] },
  counter: {
    ...theme.font["body-sm"],
    color: theme.color["on-surface-variant"],
    textAlign: "right",
  },
  iconSection: { gap: theme.space.sm },
  groupLabel: { ...theme.font.label, color: theme.color["on-surface-variant"] },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space.sm,
  },
  iconOption: {
    minWidth: theme.target.minSize,
    minHeight: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: theme.navbar.bg,
  },
  iconOptionSelected: {
    backgroundColor: theme.color.action,
    borderColor: theme.color.action,
    borderWidth: theme.focus.ringWidth,
  },
  modalActions: { gap: theme.space.sm },
  secondaryButton: {
    minHeight: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
  },
  secondaryLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  pressed: { opacity: theme.motion.opacityPressed },
});
