import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "./components/PrimaryButton";
import { MaterialSymbol } from "./components/MaterialSymbol";
import { ProfileMetricsCard } from "./components/ProfileMetricsCard";
import { ProfileShortcutItem } from "./components/ProfileShortcutItem";
import { EditProfileNameModal } from "./components/EditProfileNameModal";
import { ProfileHeaderCard } from "./components/ProfileHeaderCard";
import { themes, type OrbityTheme } from "./theme/tokens";
import {
  useProfileViewModel,
  type ProfileActions,
  type ProfileState,
} from "@/viewmodel/useProfileViewModel";
import { CosmicSky } from "./components/CosmicSky";

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
    handleOpenAchievements,
    handleOpenCategories,
    handleOpenSettings,
  } = viewModel;

  const styles = createStyles(theme);

  return (
    <SafeAreaView
      style={styles.screen}
    >
      <CosmicSky />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho da Tela */}
        <View>
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

        {/* Atalhos (protótipo, tela 5) */}
        <View style={styles.shortcuts}>
          <Text allowFontScaling accessibilityRole="header" style={styles.sectionTitle}>
            Atalhos
          </Text>
          <ProfileShortcutItem icon="star" title="Conquistas" description="Acompanhe suas conquistas" onPress={handleOpenAchievements} loading={loading} theme={theme} />
          <ProfileShortcutItem icon="category" title="Categorias" description="Organize suas categorias de estudo" onPress={handleOpenCategories} loading={loading} theme={theme} />
          <ProfileShortcutItem icon="settings" title="Configurações" description="Tema, notificações e conta" onPress={handleOpenSettings} loading={loading} theme={theme} />
        </View>
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
  const [state, actions] = useProfileViewModel();
  return <ProfileContent theme={theme} viewModel={{ ...state, ...actions }} />;
};

const ProfileScreen = ({ theme, viewModel }: ProfileScreenProps) => viewModel
  ? <ProfileContent theme={theme} viewModel={viewModel} />
  : <ConnectedProfileScreen theme={theme} />;

const createStyles = (theme: OrbityTheme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface },
  content: {
    flexGrow: 1,
    paddingTop: theme.primitive["space-32"],
    paddingHorizontal: theme.space.md,
    paddingBottom: theme.space.lg,
    gap: theme.space.lg,
  },
  shortcuts: { gap: theme.space.sm },
  sectionTitle: { ...theme.font["card-title"], color: theme.color["on-surface"] },
  title: { ...theme.font.title, color: theme.color["on-surface"] },
  errorContainer: {
    gap: theme.space.sm, backgroundColor: theme.color["surface-variant"],
    borderRadius: theme.radius.md, borderColor: theme.color.error,
    borderWidth: theme.divider.width, padding: theme.space.md,
  },
  errorText: { ...theme.font.label, color: theme.color["on-surface"] },
});

export default ProfileScreen;
