import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GradientSurface } from "./GradientSurface";
import { MaterialSymbol, type MaterialSymbolName } from "./MaterialSymbol";
import { cosmicBorders, cosmicColors, cosmicGradients, themes, type OrbityTheme } from "../theme/tokens";

export type ProfileShortcutItemProps = {
  readonly icon: MaterialSymbolName;
  readonly title: string;
  readonly description: string;
  readonly href: "/achievements" | "/categories" | "/settings";
  readonly loading?: boolean;
  readonly theme?: OrbityTheme;
};

/** Atalho do Perfil (protótipo, tela 5): quadro de ícone, título, descrição e seta. */
export const ProfileShortcutItem = ({ icon, title, description, href, loading = false, theme = themes.cosmic }: ProfileShortcutItemProps) => {
  const styles = createStyles(theme);
  if (loading) {
    return (
      <View accessible accessibilityLabel={`Carregando atalho ${title}`} accessibilityState={{ busy: true }} style={styles.item}>
        <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
        <View style={styles.tileSkeleton} />
        <View importantForAccessibility="no-hide-descendants" aria-hidden style={styles.content}>
          <View style={styles.titleSkeleton} />
          <View style={styles.descriptionSkeleton} />
        </View>
      </View>
    );
  }

  return <ProfileShortcutLink icon={icon} title={title} description={description} href={href} theme={theme} />;
};

// O skeleton desmonta este controle: seu foco local não sobrevive ao carregamento.
const ProfileShortcutLink = ({ icon, title, description, href, theme = themes.cosmic }: Omit<ProfileShortcutItemProps, "loading">) => {
  const [focused, setFocused] = useState(false);
  const styles = createStyles(theme);
  return (
    <View style={[styles.focusRing, focused && styles.focused]}>
      <Link href={href} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={title}
          accessibilityHint={description}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // O Link com asChild não repassa estilo em função: o pressionado fica no conteúdo.
          style={styles.link}
        >
          {({ pressed }) => (
            <View style={[styles.item, pressed && styles.pressed]}>
              <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
              <View style={styles.tile} accessible={false} importantForAccessibility="no-hide-descendants">
                <MaterialSymbol name={icon} filled color={theme.color.focus} size={theme.navbar.iconSize} />
              </View>
              <View style={styles.content}>
                <Text allowFontScaling style={styles.title}>
                  {title}
                </Text>
                <Text allowFontScaling style={styles.description}>
                  {description}
                </Text>
              </View>
              <MaterialSymbol name="chevron_right" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
            </View>
          )}
        </Pressable>
      </Link>
    </View>
  );
};

const createStyles = (theme: OrbityTheme) =>
  StyleSheet.create({
    link: { minHeight: theme.target.minSize, borderRadius: theme.radius.lg },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.md,
      minHeight: theme.target.minSize,
      paddingVertical: theme.space.sm,
      paddingLeft: theme.space.sm,
      paddingRight: theme.space.sm,
      borderRadius: theme.radius.lg,
      borderWidth: theme.border.widthThin,
      borderColor: cosmicBorders.card,
      backgroundColor: cosmicColors.card,
      overflow: "hidden",
    },
    tile: {
      width: theme.target.minSize,
      height: theme.target.minSize,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
      borderWidth: theme.border.widthThin,
      borderColor: cosmicBorders.sheet,
      backgroundColor: theme.color["action-subtle"],
    },
    content: { flex: 1, minWidth: 0 },
    title: { ...theme.font["card-title"], color: theme.color["on-surface"] },
    description: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
    // Contorno de foco de 2 dp afastado 2 dp do card (06-acessibilidade.md).
    focusRing: {
      borderWidth: theme.focus.ringWidth,
      borderColor: theme.color.surface,
      padding: theme.focus.ringOffset,
      margin: -(theme.focus.ringWidth + theme.focus.ringOffset),
      borderRadius: theme.radius.lg + theme.focus.ringOffset + theme.focus.ringWidth,
    },
    focused: { borderColor: theme.color.focus },
    pressed: { opacity: theme.motion.opacityPressed, transform: [{ scale: theme.motion.scalePressed }] },
    tileSkeleton: {
      width: theme.target.minSize,
      height: theme.target.minSize,
      borderRadius: theme.radius.md,
      backgroundColor: theme.color["action-subtle"],
    },
    titleSkeleton: {
      width: "60%",
      height: theme.font["card-title"].lineHeight,
      borderRadius: theme.radius.md,
      backgroundColor: theme.color["action-subtle"],
    },
    descriptionSkeleton: {
      width: "80%",
      height: theme.font["body-sm"].lineHeight,
      borderRadius: theme.radius.md,
      backgroundColor: theme.color["action-subtle"],
    },
  });
