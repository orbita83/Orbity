import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// Acompanha a preferência do sistema por movimento reduzido (ODS 1.2, Movimento).
export function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((enabled) => mounted && setReduceMotion(enabled))
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener?.("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return reduceMotion;
}
