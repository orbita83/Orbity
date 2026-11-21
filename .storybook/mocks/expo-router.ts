/**
 * Substituto do `expo-router` no Storybook. As ViewModels navegam (ARCHITECTURE.md e RULES.md),
 * mas as histórias renderizam as telas sem um navegador montado. Aqui a navegação vira uma ação
 * registrada no painel "Actions", o foco da tela roda uma vez ao montar e a rota não tem parâmetros.
 */
import { useEffect } from "react";
import { action } from "storybook/actions";

export const router = {
  navigate: action("router.navigate"),
  push: action("router.push"),
  replace: action("router.replace"),
  back: action("router.back"),
  setParams: action("router.setParams"),
  canGoBack: () => false,
};

export const useRouter = () => router;

export const useLocalSearchParams = () => ({});

export const useNavigation = () => ({ setOptions: action("navigation.setOptions") });

export const useFocusEffect = (effect: () => void | (() => void)) => {
  useEffect(effect, [effect]);
};
