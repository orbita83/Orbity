import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { container, resolveUseCase } from "@/DI/container";
import type { HomeSummary } from "@/model/entities/home-summary";
import { DomainError } from "@/model/errors/domain-error";
import type { IHomeUseCases } from "@/usecase/i-home-use-cases";
import type { FocusSheetStage } from "./ActivitySheetGeometry";

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
};

const NEXT_STAGE: Record<FocusSheetStage, FocusSheetStage> = {
  collapsed: "stage1_1",
  stage1_1: "stage1_2",
  stage1_2: "collapsed",
};

const toErrorState = (error: unknown): NonNullable<HomeState["error"]> => {
  if (error instanceof DomainError && error.code === "SCHEMA_VERSION_UNSUPPORTED") {
    return { messageKey: "error.schema", retryable: false };
  }
  return { messageKey: "error.persistence", retryable: true };
};

/**
 * Estado da Home. Recalcula ao montar e quando o app volta do segundo plano (D17, D21).
 * Um recálculo em segundo plano não volta para "carregando", e uma falha depois de pronto
 * não apaga o que já está na tela.
 */
export const useHomeViewModel = (homeUseCases?: IHomeUseCases): [HomeState, HomeActions] => {
  const useCases = resolveUseCase(homeUseCases, container.useCases.home);
  const [status, setStatus] = useState<HomeState["status"]>("loading");
  const [error, setError] = useState<HomeState["error"]>(null);
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [sheetStage, setSheetStage] = useState<FocusSheetStage>("collapsed");
  const hasSummary = useRef(false);
  const latestRequest = useRef(0);
  const mounted = useRef(true);

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
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void fetchHome();
    });
    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [fetchHome]);

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
    },
  ];
};
