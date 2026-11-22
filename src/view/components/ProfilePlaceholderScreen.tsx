import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlaceholderScreen } from "./PlaceholderScreen";
import { themes, type OrbityTheme } from "../theme/tokens";

type ProfilePlaceholderScreenProps = {
  readonly title: string;
  /** Ação da ViewModel da tela que volta para Meu perfil. */
  readonly onReturn: () => void;
  readonly theme?: OrbityTheme;
};

/** Destino provisório dos atalhos do Perfil. A navegação fica na ViewModel de cada tela. */
export const ProfilePlaceholderScreen = ({ title, onReturn, theme = themes.cosmic }: ProfilePlaceholderScreenProps) => {
  const styles = createStyles(theme);
  return <SafeAreaView style={styles.screen}>
    <PlaceholderScreen title={title} message="Esta seção estará disponível em breve." theme={theme} onReturn={onReturn} />
  </SafeAreaView>;
};

const createStyles = (theme: OrbityTheme) => StyleSheet.create({ screen: { flex: 1, backgroundColor: theme.color.surface } });
