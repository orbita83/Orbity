import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialSymbol } from "./material-symbol";
import { themes, type OrbityTheme } from "../theme/tokens";

export type ProfileHeaderCardProps = {
  readonly name?: string;
  readonly loading?: boolean;
  readonly onEditPress?: () => void;
  readonly theme?: OrbityTheme;
};

export const ProfileHeaderCard = ({
  name = "",
  loading = false,
  onEditPress,
  theme = themes.cosmic,
}: ProfileHeaderCardProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const initialLetter = name.trim().charAt(0).toUpperCase() || "?";

  if (loading) {
    return (
      <View
        style={[
          styles.cartao,
          {
            backgroundColor:
              theme.componentOverrides?.cardSurface ??
              theme.color["surface-variant"],
            borderRadius: theme.radius.lg,
            padding: theme.space.md,
            gap: theme.space.md,
          },
        ]}
        accessible={true}
        accessibilityLabel="Carregando identificação do estudante"
        accessibilityState={{ busy: true }}
      >
        <View
          style={[
            styles.avatarSkeleton,
            {
              backgroundColor: theme.color["action-subtle"],
              width: theme.target.minSize,
              height: theme.target.minSize,
              borderRadius: theme.target.minSize / 2,
            },
          ]}
        />
        <View style={styles.conteudoInfo}>
          <View
            style={[
              styles.nomeSkeleton,
              {
                backgroundColor: theme.color["action-subtle"],
                height: theme.font.title.lineHeight,
                borderRadius: theme.radius.md,
              },
            ]}
          />
          <View
            style={[
              styles.subtituloSkeleton,
              {
                backgroundColor: theme.color["action-subtle"],
                height: theme.font.label.lineHeight,
                borderRadius: theme.radius.md,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.cartao,
        {
          backgroundColor:
            theme.componentOverrides?.cardSurface ??
            theme.color["surface-variant"],
          borderRadius: theme.radius.lg,
          padding: theme.space.md,
          gap: theme.space.md,
        },
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: theme.color.action,
            width: theme.target.minSize,
            height: theme.target.minSize,
            borderRadius: theme.target.minSize / 2,
          },
        ]}
        accessible={false}
        aria-hidden={true}
      >
        <Text
          style={[
            styles.inicialTexto,
            {
              color: theme.color["on-action"],
              fontSize: theme.font.title.fontSize,
              fontWeight: theme.font.title.fontWeight,
            },
          ]}
        >
          {initialLetter}
        </Text>
      </View>

      <View style={styles.conteudoInfo}>
        <Text
          style={[
            styles.nomeTexto,
            {
              color: theme.color["on-surface"],
              fontSize: theme.font.title.fontSize,
              fontWeight: theme.font.title.fontWeight,
              lineHeight: theme.font.title.lineHeight,
            },
          ]}
          numberOfLines={2}
          accessibilityRole="header"
        >
          {name}
        </Text>
        <Text
          style={[
            styles.subtituloTexto,
            {
              color: theme.color["on-surface-variant"],
              fontSize: theme.font.label.fontSize,
              fontWeight: theme.font.label.fontWeight,
              lineHeight: theme.font.label.lineHeight,
            },
          ]}
        >
          Estudante
        </Text>
      </View>

      <Pressable
        onPress={onEditPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          styles.botaoEditar,
          {
            width: theme.target.minSize,
            height: theme.target.minSize,
            borderRadius: theme.radius.md,
          },
          pressed && { opacity: 0.75 },
          isFocused && {
            borderWidth: theme.focus.ringWidth,
            borderColor: theme.color.focus,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Editar nome do perfil"
        accessibilityHint="Abre formulário para alterar seu nome exibido"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialSymbol
          name="edit"
          size={24}
          color={theme.color["on-surface"]}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cartao: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSkeleton: {
    opacity: 0.6,
  },
  inicialTexto: {
    textAlign: "center",
  },
  conteudoInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  nomeTexto: {
    letterSpacing: -0.2,
  },
  subtituloTexto: {
    letterSpacing: 0.1,
  },
  nomeSkeleton: {
    width: "70%",
    opacity: 0.6,
  },
  subtituloSkeleton: {
    width: "35%",
    opacity: 0.4,
  },
  botaoEditar: {
    alignItems: "center",
    justifyContent: "center",
  },
});
