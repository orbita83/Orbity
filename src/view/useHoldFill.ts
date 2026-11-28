import { useState } from "react";
import { Animated, Easing, type LayoutChangeEvent } from "react-native";
import { motionTokens } from "./theme/tokens";
import { useReduceMotion } from "./theme/useReduceMotion";

/**
 * Preenchimento do toque longo (ODS 1.3, fill-on-hold) dos cards de Tarefas e Rotinas: cresce da
 * esquerda para a direita durante `motion.duration.hold` e volta em `motion.duration.short` ao
 * soltar antes. Com movimento reduzido, não anima: fica só o contorno em `color.action`.
 */
export const useHoldFill = () => {
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(0));
  const [holding, setHolding] = useState(false);
  const [width, setWidth] = useState(0);

  const start = () => {
    setHolding(true);
    if (reduceMotion) return;
    Animated.timing(progress, {
      toValue: 1,
      duration: motionTokens.durationHold,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };
  const end = () => {
    setHolding(false);
    if (reduceMotion) return;
    Animated.timing(progress, { toValue: 0, duration: motionTokens.durationShort, useNativeDriver: true }).start();
  };

  return {
    holding,
    /** Pronto para medir: o preenchimento só aparece depois que a largura do card é conhecida. */
    ready: width > 0,
    onLayout: (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width),
    translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] }),
    start,
    end,
  };
};
