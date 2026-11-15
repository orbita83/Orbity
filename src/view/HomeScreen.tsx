import { useReduceMotion } from "./theme/use-reduce-motion";
import { useHomeViewModel } from "../viewmodel/HomeViewModel";
import { HomeScreenContent } from "./HomeScreenContent";

/** Tela Início: liga a ViewModel à apresentação (HomeScreenContent). */
const HomeScreen = () => {
  const vm = useHomeViewModel();
  const reduceMotion = useReduceMotion();

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
