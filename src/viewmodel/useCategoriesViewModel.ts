import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Platform } from "react-native";

/** A tela Categorias ainda é provisória: não tem estado próprio. */
export type CategoriesState = Record<never, never>;

export type CategoriesActions = {
  /** Volta para Meu perfil, de onde o atalho Categorias abre. */
  handleReturnToProfile: () => void;
};

/**
 * Estado e navegação da tela provisória Categorias. Volta para Meu perfil pelo botão da tela e, no
 * Android, pelo voltar do sistema, inclusive quando a tela foi aberta direto pela URL.
 */
export const useCategoriesViewModel = (): CategoriesState & CategoriesActions => {
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

  return { handleReturnToProfile };
};
