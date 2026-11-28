import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "./components/PrimaryButton";
import { ScreenHeader } from "./components/ScreenHeader";
import { themes } from "./theme/tokens";
import { useSettingsViewModel, type SettingsActions, type SettingsState } from "../viewmodel/useSettingsViewModel";

type SettingsScreenProps = { viewModel?: SettingsState & SettingsActions };

const SettingsContent = ({ viewModel }: { viewModel: SettingsState & SettingsActions }) => (
  <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
    <ScreenHeader title="Configurações" backLabel="Voltar ao perfil" onBack={viewModel.handleReturnToProfile} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text accessibilityRole="header" style={styles.title}>Privacidade</Text>
      <Text style={styles.body}>Saiba como o Orbity utiliza os seus dados e como entrar em contato com a equipe.</Text>
      <PrimaryButton
        label="Política de privacidade"
        accessibilityRole="link"
        accessibilityHint="Abre a política no navegador externo. Requer conexão com a internet."
        onPress={() => { void viewModel.handleOpenPrivacyPolicy(); }}
        disabled={viewModel.openingPolicy}
        busy={viewModel.openingPolicy}
        theme={theme}
      />
      {viewModel.openingPolicy ? <Text accessibilityLiveRegion="polite" style={styles.body}>Abrindo o navegador…</Text> : null}
      {viewModel.error ? (
        <View accessibilityLiveRegion="polite">
          <Text accessibilityRole="alert" style={styles.body}>{viewModel.error}</Text>
        </View>
      ) : null}
      <Text selectable style={styles.address}>{viewModel.policyUrl}</Text>
    </ScrollView>
  </SafeAreaView>
);

const SettingsConnected = () => {
  const [state, actions] = useSettingsViewModel();
  return <SettingsContent viewModel={{ ...state, ...actions }} />;
};

const SettingsScreen = ({ viewModel }: SettingsScreenProps) => viewModel
  ? <SettingsContent viewModel={viewModel} />
  : <SettingsConnected />;

export default SettingsScreen;

const theme = themes.cosmic;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface },
  content: { padding: theme.space.md, gap: theme.space.md },
  title: { ...theme.font.title, color: theme.color["on-surface"] },
  body: { ...theme.font.body, color: theme.color["on-surface"] },
  address: { ...theme.font.body, color: theme.color["on-surface-variant"] },
});
