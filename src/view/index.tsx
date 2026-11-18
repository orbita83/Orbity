import { useReduceMotion } from "./theme/use-reduce-motion";
import { useHomeViewModel } from "../viewmodel/useHomeViewModel";
import { HomeScreenContent } from "./index-content";

/** Tela Início: liga a ViewModel à apresentação (HomeScreenContent). A ViewModel recalcula ao ganhar foco. */
const HomeScreen = () => {
  const [state, actions] = useHomeViewModel();
  const reduceMotion = useReduceMotion();

  return (
    <HomeScreenContent
      status={state.status}
      error={state.error}
      summary={state.summary}
      progressLabel={state.progressLabel}
      sheetStage={state.sheetStage}
      reduceMotion={reduceMotion}
      onRetry={() => void actions.retry()}
      onCycleSheetStage={actions.handleCycleSheetStage}
      onCollapseSheet={actions.handleCollapseSheet}
      onExpandSheet={actions.handleExpandSheet}
      onReduceSheet={actions.handleReduceSheet}
      onSetSheetStage={actions.handleSetSheetStage}
    />
  );
};

export default HomeScreen;
