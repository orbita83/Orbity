import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AchievementMilestone,
  HomeDashboardData,
} from "../model/entities/home-dashboard";
import type { IHomeUseCases } from "../usecase/i-home-use-cases";
import { PROTOTYPE_HOME_DASHBOARD } from "../infra/repositories/in-memory-home-repository";
import type { NavTabId } from "../view/components/nav-bar";

export type FocusSheetStage = "collapsed" | "stage1_1" | "stage1_2";

export type HomeViewModelOptions = {
  initialData?: HomeDashboardData;
  initialLoading?: boolean;
  initialStage?: FocusSheetStage;
  initialFocusMode?: boolean;
};

export type HomeState = {
  dashboard: HomeDashboardData;
  loading: boolean;
  error: string | null;
  activeTab: NavTabId;
  sheetStage: FocusSheetStage;
  isFocusMode: boolean;
  isNavBarVisible: boolean;
  selectedAchievement: AchievementMilestone | null;
  statusAnnouncement: string | null;
  focusTimerLabel: string;
};

export type HomeActions = {
  handleToggleFocusMode: () => Promise<void>;
  handleCycleSheetStage: () => void;
  handleCollapseSheet: () => void;
  handleExpandToAchievements: () => void;
  handleSelectTab: (tabId: NavTabId) => void;
  handleSelectAchievement: (milestone: AchievementMilestone | null) => void;
  handleExpandSheet: () => void;
  handleReduceSheet: () => void;
  handleSetSheetStage: (stage: FocusSheetStage) => void;
};

const NEXT_STAGE_MAP: Record<FocusSheetStage, FocusSheetStage> = {
  collapsed: "stage1_1",
  stage1_1: "stage1_2",
  stage1_2: "collapsed",
};

export const useHomeViewModel = (
  homeUseCases: IHomeUseCases,
  options: HomeViewModelOptions = {},
): HomeState & HomeActions => {
  const [dashboard, setDashboard] = useState<HomeDashboardData>(
    options.initialData ?? PROTOTYPE_HOME_DASHBOARD,
  );
  const [loading, setLoading] = useState<boolean>(
    options.initialLoading ?? false,
  );
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTabId>("inicio");
  const [sheetStage, setSheetStage] = useState<FocusSheetStage>(
    options.initialStage ?? "collapsed",
  );
  const [isFocusMode, setIsFocusMode] = useState<boolean>(
    options.initialFocusMode ?? false,
  );
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementMilestone | null>(null);
  const [statusAnnouncement, setStatusAnnouncement] = useState<string | null>(
    null,
  );
  const focusStartedAt = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isFocusMode) return;
    if (focusStartedAt.current === null) focusStartedAt.current = Date.now();
    const interval = setInterval(() => {
      if (focusStartedAt.current !== null) setElapsedSeconds(Math.floor((Date.now() - focusStartedAt.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFocusMode]);

  const handleToggleFocusMode = async (): Promise<void> => {
    setError(null);
    if (!isFocusMode) {
      focusStartedAt.current = Date.now();
      setElapsedSeconds(0);
      setIsFocusMode(true);
      setSheetStage("stage1_1");
      setStatusAnnouncement(
        "Modo foco iniciado. Concentre-se no seu momento de estudo.",
      );
      return;
    }

    setLoading(true);
    try {
      const minutes = Math.floor((Date.now() - (focusStartedAt.current ?? Date.now())) / 60000);
      if (minutes > 0) {
        const updated = await homeUseCases.completeFocusSession(minutes);
        setDashboard(updated);
      }
      setIsFocusMode(false);
      focusStartedAt.current = null;
      setStatusAnnouncement(
        minutes > 0 ? `Sessão concluída! ${minutes} minuto${minutes === 1 ? "" : "s"} de estudo registrado${minutes === 1 ? "" : "s"}.` : "Sessão encerrada. Continue no seu ritmo.",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o progresso de foco.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCycleSheetStage = useCallback((): void => {
    setSheetStage((prev) => NEXT_STAGE_MAP[prev]);
  }, []);

  const handleCollapseSheet = useCallback((): void => {
    setSheetStage("collapsed");
  }, []);

  const handleExpandSheet = useCallback((): void => {
    setSheetStage((current) => current === "collapsed" ? "stage1_1" : "stage1_2");
  }, []);

  const handleReduceSheet = useCallback((): void => {
    setSheetStage((current) => current === "stage1_2" ? "stage1_1" : "collapsed");
  }, []);

  const handleSetSheetStage = useCallback((stage: FocusSheetStage): void => {
    setSheetStage(stage);
  }, []);

  const handleExpandToAchievements = (): void => {
    setSheetStage("stage1_2");
  };

  const handleSelectTab = (tabId: NavTabId): void => {
    setActiveTab(tabId);
  };

  const handleSelectAchievement = (
    milestone: AchievementMilestone | null,
  ): void => {
    setSelectedAchievement(milestone);
  };

  // A referência aprovada mantém a navegação nos três estágios do painel.
  const isNavBarVisible = !isFocusMode;
  const remainingSeconds = Math.max(0, dashboard.dailyProgress.targetMinutes * 60 - elapsedSeconds);
  const focusTimerLabel = `${Math.floor(remainingSeconds / 60).toString().padStart(2, "0")}:${(remainingSeconds % 60).toString().padStart(2, "0")}`;

  return {
    dashboard,
    loading,
    error,
    activeTab,
    sheetStage,
    isFocusMode,
    isNavBarVisible,
    selectedAchievement,
    statusAnnouncement,
    focusTimerLabel,
    handleToggleFocusMode,
    handleCycleSheetStage,
    handleCollapseSheet,
    handleExpandToAchievements,
    handleSelectTab,
    handleSelectAchievement,
    handleExpandSheet,
    handleReduceSheet,
    handleSetSheetStage,
  };
};
