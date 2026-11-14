import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

const ProfileScreen = ({
  theme = themes.cosmic,
  viewModel,
}: ProfileScreenProps) => {
  const defaultViewModel = useProfileViewModel();
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
  } = viewModel ?? defaultViewModel;

  return (
    <SafeAreaView
      style={[
        styles.telaContainer,
        {
          backgroundColor: theme.color.surface,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.conteudoScroll,
          {
            padding: theme.space.md,
            gap: theme.space.md,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho da Tela */}
        <View style={styles.areaCabecalho}>
          <Text
            style={[
              styles.tituloCabecalho,
              {
                color: theme.color["on-surface"],
                fontSize: theme.font.title.fontSize,
                fontWeight: theme.font.title.fontWeight,
                lineHeight: theme.font.title.lineHeight,
              },
            ]}
            accessibilityRole="header"
          >
            Meu perfil
          </Text>
        </View>

        {/* Notificação de Erro Global */}
        {error ? (
          <View
            style={[
              styles.areaErroGlobal,
              {
                backgroundColor: theme.color["action-subtle"],
                borderRadius: theme.radius.md,
                borderColor: theme.color.error,
                padding: theme.space.md,
              },
            ]}
            accessibilityRole="alert"
          >
            <Text
              style={[
                styles.textoErroGlobal,
                {
                  color: theme.color.error,
                  fontSize: theme.font.label.fontSize,
                  lineHeight: theme.font.label.lineHeight,
                },
              ]}
            >
              {error}
            </Text>
            <Pressable
              onPress={() => {
                clearError();
                loadProfile();
              }}
              style={[
                styles.botaoTentarNovamente,
                {
                  minHeight: theme.target.minSize,
                  paddingHorizontal: theme.space.md,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Tentar carregar o perfil novamente"
            >
              <Text
                style={[
                  styles.textoBotaoTentarNovamente,
                  {
                    color: theme.color["on-surface"],
                    fontSize: theme.font.label.fontSize,
                    fontWeight: "600",
                  },
                ]}
              >
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Cartão de Identificação */}
        <ProfileHeaderCard
          name={profile?.name ?? ""}
          loading={loading}
          onEditPress={openEditNameModal}
          theme={theme}
        />

        {/* Espaço reservado para as métricas e atalhos da Sub-issue #124 */}
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

const styles = StyleSheet.create({
  telaContainer: {
    flex: 1,
  },
  conteudoScroll: {
    flexGrow: 1,
  },
  areaCabecalho: {
    paddingVertical: 8,
  },
  tituloCabecalho: {
    letterSpacing: -0.3,
  },
  areaErroGlobal: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  textoErroGlobal: {
    flex: 1,
    fontWeight: "500",
  },
  botaoTentarNovamente: {
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotaoTentarNovamente: {
    textDecorationLine: "underline",
  },
});

export default ProfileScreen;
