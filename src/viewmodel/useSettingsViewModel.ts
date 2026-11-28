import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { BackHandler, Platform } from "react-native";
import { container, resolveUseCase } from "@/di/container";
import { PRIVACY_POLICY_URL } from "@/model/entities/privacyPolicy";
import { ExternalLinkServiceError } from "@/model/errors";
import type { IPrivacyUseCases } from "@/usecase/iPrivacyUseCases";

export type SettingsState = {
  policyUrl: string;
  openingPolicy: boolean;
  error: string | null;
};

export type SettingsActions = {
  /** Volta para Meu perfil, de onde o atalho Configurações abre. */
  handleReturnToProfile: () => void;
  handleOpenPrivacyPolicy: () => Promise<void>;
};

/**
 * Estado e navegação de Configurações. Volta para Meu perfil pelo botão da tela e, no
 * Android, pelo voltar do sistema, inclusive quando a tela foi aberta direto pela URL.
 */
export const useSettingsViewModel = (override?: IPrivacyUseCases): [SettingsState, SettingsActions] => {
  const privacy = resolveUseCase(override, container.useCases.privacy);
  const [openingPolicy, setOpeningPolicy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openingRef = useRef(false);
  const handleOpenPrivacyPolicy = useCallback(async () => {
    if (openingRef.current) return;
    openingRef.current = true;
    setOpeningPolicy(true);
    setError(null);
    try {
      await privacy.openPolicy();
    } catch (cause) {
      setError(cause instanceof ExternalLinkServiceError
        ? cause.message
        : "Não foi possível abrir a política de privacidade. Tente novamente ou copie o endereço abaixo para o navegador.");
    } finally {
      openingRef.current = false;
      setOpeningPolicy(false);
    }
  }, [privacy]);
  const handleReturnToProfile = useCallback(() => {
    router.replace("/profile");
  }, []);

  // O voltar do Android só é tratado enquanto a tela está em foco.
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        handleReturnToProfile();
        return true;
      });
      return () => subscription.remove();
    }, [handleReturnToProfile]),
  );

  return [{ policyUrl: PRIVACY_POLICY_URL, openingPolicy, error }, { handleReturnToProfile, handleOpenPrivacyPolicy }];
};
