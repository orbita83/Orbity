import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "./components/primary-button";
import { MaterialSymbol } from "./components/material-symbol";
import { ProfileMetricsCard } from "./components/ProfileMetricsCard";
import { ProfileShortcutItem } from "./components/ProfileShortcutItem";
import { EditProfileNameModal } from "./components/EditProfileNameModal";
import { ProfileHeaderCard } from "./components/ProfileHeaderCard";
import { themes, type OrbityTheme } from "./theme/tokens";
import {
  useProfileViewModel,
  type ProfileActions,
  type ProfileState,
} from "@/viewmodel/ProfileViewModel";

export type ProfileScreenProps = {
  readonly theme?: OrbityTheme;
  readonly viewModel?: ProfileState & ProfileActions;
};

const ProfileContent = ({
  theme = themes.cosmic,
  viewModel,
}: ProfileScreenProps & { readonly viewModel: ProfileState & ProfileActions }) => {
  const {
    profile,
    loading,
    saving,
    error,
    validationError,
    isEditingName,
    nameInput,
    loadProfile,
    openEditNameModal,
    closeEditNameModal,
    setNameInput,
    saveName,
    clearError,
  } = viewModel;

  const styles = createStyles(theme);

  return (
    <SafeAreaView
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho da Tela */}
        <View style={styles.header}>
          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            Meu perfil
          </Text>
        </View>

        {/* Notificação de Erro Global */}
        {error ? (
          <View
            style={styles.errorContainer}
          >
            <MaterialSymbol name="info" color={theme.color.error} size={theme.space.lg} />
            <Text
              style={styles.errorText}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              {error}
            </Text>
            <PrimaryButton label="Tentar novamente" accessibilityHint="Tentar carregar o perfil novamente" onPress={() => { clearError(); void loadProfile(); }} theme={theme} />
          </View>
        ) : null}

        {/* Cartão de Identificação */}
        <ProfileHeaderCard
          name={profile?.name ?? ""}
          loading={loading}
          onEditPress={openEditNameModal}
          theme={theme}
        />

        <ProfileMetricsCard metrics={profile} loading={loading} theme={theme} />
        <ProfileShortcutItem icon="emoji_events" title="Conquistas" description="Acompanhe suas conquistas" href="/achievements" loading={loading} theme={theme} />
        <ProfileShortcutItem icon="category" title="Categorias" description="Organize suas categorias de estudo" href="/categories" loading={loading} theme={theme} />
        <ProfileShortcutItem icon="settings" title="Configurações" description="Acesse as configurações do aplicativo" href="/settings" loading={loading} theme={theme} />
      </ScrollView>

      {/* Modal de Edição de Nome */}
      <EditProfileNameModal
        visible={isEditingName}
        name={nameInput}
        saving={saving}
        validationError={validationError}
        onChangeName={setNameInput}
        onSave={saveName}
        onClose={closeEditNameModal}
        theme={theme}
      />
    </SafeAreaView>
  );
};

const ConnectedProfileScreen = ({ theme }: Pick<ProfileScreenProps, "theme">) => {
  const viewModel = useProfileViewModel();
  return <ProfileContent theme={theme} viewModel={viewModel} />;
};

const ProfileScreen = ({ theme, viewModel }: ProfileScreenProps) => viewModel
  ? <ProfileContent theme={theme} viewModel={viewModel} />
  : <ConnectedProfileScreen theme={theme} />;

const createStyles = (theme: OrbityTheme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface },
  content: { flexGrow: 1, padding: theme.space.md, gap: theme.space.md },
  header: { paddingVertical: theme.space.sm },
  title: { ...theme.font.title, color: theme.color["on-surface"] },
  errorContainer: {
    gap: theme.space.sm, backgroundColor: theme.color["surface-variant"],
    borderRadius: theme.radius.md, borderColor: theme.color.error,
    borderWidth: theme.divider.width, padding: theme.space.md,
  },
  errorText: { ...theme.font.label, color: theme.color["on-surface"] },
});

export default ProfileScreen;
