import { useRef, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { cosmicTokens as t } from "../theme/tokens";
import { CosmicIcon } from "./cosmic-icon";
import { PrimaryButton } from "./primary-button";

type HomeDialogProps = { visible: boolean; title: string; body: string; onClose: () => void; children?: ReactNode };

export const HomeDialog = ({ visible, title, body, onClose, children }: HomeDialogProps) => {
  const closeRef = useRef<View>(null);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onShow={() => closeRef.current?.focus()}>
      <Pressable accessibilityRole="none" onPress={onClose} style={styles.backdrop}>
        <Pressable accessibilityRole="none" accessibilityViewIsModal onAccessibilityEscape={onClose} onPress={(event) => event.stopPropagation()} style={styles.dialog}>
          <View style={styles.heading}>
            <Text accessibilityRole="header" allowFontScaling style={styles.title}>{title}</Text>
            <Pressable ref={closeRef} accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} style={styles.close}><CosmicIcon name="close" /></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <Text allowFontScaling style={styles.body}>{body}</Text>
            {children}
          </ScrollView>
          <PrimaryButton appearance="cosmic" label="Continuar minha jornada" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: t.color.scrim, alignItems: "center", justifyContent: "center", padding: t.space.xxl },
  dialog: { backgroundColor: t.color.sheet, borderColor: t.color.sheetBorder, borderWidth: t.border.subtle, borderRadius: t.radius.sheet, padding: t.space.xl, width: "100%", maxWidth: t.layout.dialogMaxWidth, maxHeight: "80%", gap: t.space.lg },
  heading: { flexDirection: "row", alignItems: "center", gap: t.space.sm },
  title: { ...t.font.button, color: t.color.text, flex: 1 },
  close: { minWidth: t.layout.touchTarget, minHeight: t.layout.touchTarget, alignItems: "center", justifyContent: "center" },
  content: { gap: t.space.lg },
  body: { ...t.font.body, color: t.color.muted },
});
