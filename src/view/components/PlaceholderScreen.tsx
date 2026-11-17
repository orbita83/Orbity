import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";
import { themes, type OrbityTheme } from "../theme/tokens";

type PlaceholderScreenProps = {
  readonly title: string;
  readonly message: string;
  readonly theme?: OrbityTheme;
  readonly onReturn?: () => void;
};

export const PlaceholderScreen = ({ title, message, theme = themes.cosmic, onReturn }: PlaceholderScreenProps) => {
  const styles = createStyles(theme);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.group}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {onReturn && <PrimaryButton label="Voltar ao perfil" onPress={onReturn} theme={theme} />}
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: OrbityTheme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface },
  content: { flexGrow: 1, justifyContent: "center", padding: theme.space.md },
  group: { gap: theme.space.sm },
  title: { ...theme.font.title, color: theme.color["on-surface"] },
  message: { ...theme.font.body, color: theme.color["on-surface-variant"] },
});
