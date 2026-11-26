import { useFocusSessionViewModel } from "../viewmodel/useFocusSessionViewModel";
import { FocusSessionScreenContent } from "./focus-session-content";
import { useReduceMotion } from "./theme/useReduceMotion";

/** Tela do Modo Foco (Pomodoro, issue #217): conecta a ViewModel à apresentação. */
const FocusSessionScreen = () => {
  const [state, actions] = useFocusSessionViewModel();
  const reduceMotion = useReduceMotion();
  const { handleBack, ...restActions } = actions;

  return (
    <FocusSessionScreenContent
      {...state}
      {...restActions}
      reduceMotion={reduceMotion}
      onBack={handleBack}
    />
  );
};

export default FocusSessionScreen;
