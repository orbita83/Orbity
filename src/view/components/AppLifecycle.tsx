import { useAppLifecycleViewModel } from "@/viewmodel/useAppLifecycleViewModel";

/**
 * Ponto raiz dos efeitos globais do app (ADR-0003). Montado uma vez em `src/app/_layout.tsx`,
 * não desenha nada: só mantém a `useAppLifecycleViewModel` ativa durante toda a sessão.
 */
export const AppLifecycle = () => {
  useAppLifecycleViewModel();
  return null;
};
