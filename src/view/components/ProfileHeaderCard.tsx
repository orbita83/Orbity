import { Pressable, StyleSheet, Text, View } from "react-native";
import { GradientSurface } from "./GradientSurface";
import { MaterialSymbol } from "./MaterialSymbol";
import { cosmicBorders, cosmicColors, cosmicGradients, themes, type OrbityTheme } from "../theme/tokens";

export type ProfileHeaderCardProps = {
  readonly name?: string;
  readonly loading?: boolean;
  readonly onEditPress?: () => void;
  readonly theme?: OrbityTheme;
};

/** Cartão de identificação do Perfil (protótipo, tela 5): avatar com a inicial, nome, papel e editar. */
export const ProfileHeaderCard = ({
  name = "",
  loading = false,
  onEditPress,
  theme = themes.cosmic,
}: ProfileHeaderCardProps) => {
  const styles = createStyles(theme);
  const initialLetter = name.trim().charAt(0).toUpperCase() || "?";

  if (loading) {
    return (
      <View
        style={styles.card}
        accessible
        accessibilityLabel="Carregando identificação do estudante"
        accessibilityState={{ busy: true }}
      >
        <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
        <View style={styles.avatarSkeleton} />
        <View style={styles.texts} importantForAccessibility="no-hide-descendants" aria-hidden>
          <View style={styles.nameSkeleton} />
          <View style={styles.roleSkeleton} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
      <View style={styles.avatar} accessible={false} importantForAccessibility="no-hide-descendants">
        <GradientSurface from={cosmicColors.actionHover} to={cosmicColors.action} />
        <Text allowFontScaling={false} style={styles.initial}>
          {initialLetter}
        </Text>
      </View>
      <View style={styles.texts}>
        <Text allowFontScaling numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text allowFontScaling style={styles.role}>
          Estudante
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Editar nome do perfil"
        onPress={onEditPress}
        style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
      >
        <MaterialSymbol name="edit" filled color={theme.color.focus} size={theme.navbar.iconSize} />
      </Pressable>
    </View>
  );
};

const createStyles = (theme: OrbityTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.md,
      padding: theme.space.md,
      borderRadius: theme.radius.lg,
      borderWidth: theme.border.widthThin,
      borderColor: cosmicBorders.card,
      backgroundColor: cosmicColors.card,
      overflow: "hidden",
    },
    avatar: {
      width: theme.achievement.size,
      height: theme.achievement.size,
      borderRadius: theme.achievement.size / 2,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    // A inicial é decorativa: o nome completo vem logo ao lado, em texto real.
    initial: { ...theme.font.title, color: theme.color["on-surface"] },
    texts: { flex: 1, minWidth: 0 },
    name: { ...theme.font.title, color: theme.color["on-surface"] },
    role: { ...theme.font.body, color: theme.color["on-surface-variant"] },
    editButton: {
      width: theme.target.minSize,
      height: theme.target.minSize,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
      borderWidth: theme.border.widthThin,
      borderColor: cosmicBorders.sheet,
      backgroundColor: cosmicColors.sheet,
    },
    pressed: { opacity: theme.motion.opacityPressed, transform: [{ scale: theme.motion.scalePressed }] },
    avatarSkeleton: {
      width: theme.achievement.size,
      height: theme.achievement.size,
      borderRadius: theme.achievement.size / 2,
      backgroundColor: theme.color["action-subtle"],
    },
    nameSkeleton: {
      width: "60%",
      height: theme.font.title.lineHeight,
      borderRadius: theme.radius.md,
      backgroundColor: theme.color["action-subtle"],
    },
    roleSkeleton: {
      width: "40%",
      height: theme.font.body.lineHeight,
      borderRadius: theme.radius.md,
      backgroundColor: theme.color["action-subtle"],
    },
  });
