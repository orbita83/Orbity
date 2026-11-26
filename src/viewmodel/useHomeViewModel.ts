import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { container, resolveUseCase } from "@/di/container";
import type { HomeSummary } from "@/model/entities/homeSummary";
import { SchemaVersionError } from "@/model/errors";
import type { IFocusUseCases } from "@/usecase/iFocusUseCases";
import type { IHomeUseCases } from "@/usecase/iHomeUseCases";

/** Estágio do painel de foco da Home: recolhido, intermediário ou aberto. */
export type FocusSheetStage = "collapsed" | "stage1_1" | "stage1_2";

export type HomeErrorMessageKey = "error.persistence" | "error.schema";

export type HomeState = {
  status: "loading" | "error" | "ready";
  error: { messageKey: HomeErrorMessageKey; retryable: boolean } | null;
  summary: HomeSummary | null;
  /** Texto "concluídas/total", sempre visível (RN-0007). */
  progressLabel: string;
  sheetStage: FocusSheetStage;
};

export type HomeActions = {
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
  handleCycleSheetStage: () => void;
  handleCollapseSheet: () => void;
  handleExpandSheet: () => void;
  handleReduceSheet: () => void;
  handleSetSheetStage: (stage: FocusSheetStage) => void;
  handleOpenFocus: () => void;
};

const NEXT_STAGE: Record<FocusSheetStage, FocusSheetStage> = {
  collapsed: "stage1_1",
  stage1_1: "stage1_2",
  stage1_2: "collapsed",
};

const toErrorState = (error: unknown): NonNullable<HomeState["error"]> => {
  if (error instanceof SchemaVersionError) {
    return { messageKey: "error.schema", retryable: false };
  }
  return { messageKey: "error.persistence", retryable: true };
};

/**
 * Estado da Home. Recalcula ao montar e quando o app volta do segundo plano (D17, D21).
 * Um recálculo em segundo plano não volta para "carregando", e uma falha depois de pronto
 * não apaga o que já está na tela.
 */
export const useHomeViewModel = (
  homeUseCases?: IHomeUseCases,
  focusUseCases?: IFocusUseCases,
): [HomeState, HomeActions] => {
  const useCases = resolveUseCase(homeUseCases, container.useCases.home);
  const resolvedFocus =
    homeUseCases && !focusUseCases ? undefined : resolveUseCase(focusUseCases, container.useCases.focus);
  const [status, setStatus] = useState<HomeState["status"]>("loading");
  const [error, setError] = useState<HomeState["error"]>(null);
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [sheetStage, setSheetStage] = useState<FocusSheetStage>("collapsed");
  const hasSummary = useRef(false);
  const latestRequest = useRef(0);
  const mounted = useRef(true);

  const handleOpenFocus = useCallback(() => {
    router.navigate("/focus-session");
  }, []);

  // Os setState ficam só nos callbacks da promessa, nunca de forma síncrona no efeito.
  const fetchHome = useCallback((): Promise<void> => {
    const request = ++latestRequest.current;
    const isCurrent = () => mounted.current && request === latestRequest.current;
    return useCases.loadHome().then(
      (next) => {
        if (!isCurrent()) return;
        hasSummary.current = true;
        setSummary(next);
        setError(null);
        setStatus("ready");
      },
      (caught: unknown) => {
        // Depois de pronto, mantém o valor anterior na tela; a próxima volta ao app tenta de novo.
        if (!isCurrent() || hasSummary.current) return;
        setError(toErrorState(caught));
        setStatus("error");
      },
    );
  }, [useCases]);

  useEffect(() => {
    mounted.current = true;
    // O estado inicial já é "carregando".
    void fetchHome();
    const unsubscribeDay = useCases.subscribeDayChange?.(() => {
      void fetchHome();
    });
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void fetchHome();
      }
    });
    const unsubscribeNotification = resolvedFocus?.onCycleNotificationPress(() => {
      handleOpenFocus();
    });
    return () => {
      mounted.current = false;
      unsubscribeDay?.();
      appStateSubscription.remove();
      unsubscribeNotification?.();
    };
  }, [fetchHome, handleOpenFocus, resolvedFocus, useCases]);

  // Recalcula ao voltar para a aba, para refletir o que mudou em Tarefas e Rotinas.
  useFocusEffect(
    useCallback(() => {
      void fetchHome();
    }, [fetchHome]),
  );

  const retry = useCallback((): Promise<void> => {
    setStatus("loading");
    setError(null);
    return fetchHome();
  }, [fetchHome]);

  const handleCycleSheetStage = useCallback(() => setSheetStage((current) => NEXT_STAGE[current]), []);
  const handleCollapseSheet = useCallback(() => setSheetStage("collapsed"), []);
  const handleExpandSheet = useCallback(
    () => setSheetStage((current) => (current === "collapsed" ? "stage1_1" : "stage1_2")),
    [],
  );
  const handleReduceSheet = useCallback(
    () => setSheetStage((current) => (current === "stage1_2" ? "stage1_1" : "collapsed")),
    [],
  );
  const handleSetSheetStage = useCallback((stage: FocusSheetStage) => setSheetStage(stage), []);

  const progress = summary?.progress;
  return [
    {
      status,
      error,
      summary,
      progressLabel: `${progress?.completed ?? 0}/${progress?.total ?? 0}`,
      sheetStage,
    },
    {
      retry,
      refresh: fetchHome,
      handleCycleSheetStage,
      handleCollapseSheet,
      handleExpandSheet,
      handleReduceSheet,
      handleSetSheetStage,
      handleOpenFocus,
    },
  ];
};
