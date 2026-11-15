import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialSymbol, type MaterialSymbolName } from "./material-symbol";
import { themes, type OrbityTheme } from "../theme/tokens";

export type ProfileShortcutItemProps = {
  readonly icon: MaterialSymbolName;
  readonly title: string;
  readonly description: string;
  readonly href: "/achievements" | "/categories" | "/settings";
  readonly loading?: boolean;
  readonly theme?: OrbityTheme;
};

export const ProfileShortcutItem = ({ icon, title, description, href, loading = false, theme = themes.cosmic }: ProfileShortcutItemProps) => {
  const styles = createStyles(theme);
  if (loading) return <View accessible accessibilityLabel={`Carregando atalho ${title}`} accessibilityState={{ busy: true }} style={styles.container}>
    <View importantForAccessibility="no-hide-descendants" aria-hidden style={styles.skeletonGroup}>
      <View style={styles.titleSkeleton} />
      <View style={styles.descriptionSkeleton} />
    </View>
  </View>;

  return <ProfileShortcutLink icon={icon} title={title} description={description} href={href} theme={theme} />;
};

// O skeleton desmonta este controle: seu foco local não sobrevive ao carregamento.
const ProfileShortcutLink = ({ icon, title, description, href, theme = themes.cosmic }: Omit<ProfileShortcutItemProps, "loading">) => {
  const [focused, setFocused] = useState(false);
  const styles = createStyles(theme);
  return <View style={[styles.focusContainer, focused && styles.focused]}>
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={title} accessibilityHint={description} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={StyleSheet.flatten([
        styles.item, styles.container,
      ])}>
        {({ pressed }) => <>
          <View style={pressed && styles.pressed}><MaterialSymbol name={icon} color={theme.color["on-surface"]} size={theme.space.lg} /></View>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <MaterialSymbol name="chevron_right" color={theme.color["on-surface-variant"]} size={theme.space.lg} />
        </>}
      </Pressable>
    </Link>
  </View>;
};

const createStyles = (theme: OrbityTheme) => StyleSheet.create({
  container: { minHeight: theme.target.minSize, minWidth: theme.target.minSize, padding: theme.space.md, gap: theme.space.md, borderRadius: theme.radius.md, backgroundColor: theme.color["surface-variant"] },
  skeletonGroup: { gap: theme.space.sm },
  item: { flexDirection: "row", alignItems: "center" },
  content: { flex: 1, flexShrink: 1 },
  titleSkeleton: { width: "60%", height: theme.font.body.lineHeight, backgroundColor: theme.color["action-subtle"], borderRadius: theme.radius.md },
  descriptionSkeleton: { width: "80%", height: theme.font.label.lineHeight, backgroundColor: theme.color["action-subtle"], borderRadius: theme.radius.md },
  focusContainer: {
    borderWidth: theme.focus.ringWidth,
    borderColor: theme.color.surface,
    padding: theme.focus.ringOffset,
    borderRadius: theme.radius.md + theme.focus.ringOffset + theme.focus.ringWidth,
  },
  focused: { borderColor: theme.color.focus },
  pressed: { opacity: theme.feedback.pressedOpacity },
  title: { ...theme.font.body, color: theme.color["on-surface"] },
  description: { ...theme.font.label, color: theme.color["on-surface"] },
});
