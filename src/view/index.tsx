import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useReduceMotion } from "./theme/use-reduce-motion";
import { useHomeViewModel } from "../viewmodel/HomeViewModel";
import { HomeScreenContent } from "./index-content";

/** Tela Início: liga a ViewModel à apresentação (HomeScreenContent). */
const HomeScreen = () => {
  const vm = useHomeViewModel();
  const { refresh } = vm;
  const reduceMotion = useReduceMotion();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <HomeScreenContent
      status={vm.status}
      error={vm.error}
      summary={vm.summary}
      progressLabel={vm.progressLabel}
      sheetStage={vm.sheetStage}
      reduceMotion={reduceMotion}
      onRetry={() => void vm.retry()}
      onCycleSheetStage={vm.handleCycleSheetStage}
      onCollapseSheet={vm.handleCollapseSheet}
      onExpandSheet={vm.handleExpandSheet}
      onReduceSheet={vm.handleReduceSheet}
      onSetSheetStage={vm.handleSetSheetStage}
    />
  );
};

export default HomeScreen;
