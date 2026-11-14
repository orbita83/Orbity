import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, PanResponder, type PanResponderGestureState } from "react-native";
import {
  ARTWORK_OFFSET_RATIO,
  SHEET_GESTURE,
  clampSheetTop,
  createSheetSnapPoints,
  resolveSheetRelease,
  type FocusSheetStage,
  type SheetGeometryConfig,
} from "./ActivitySheetGeometry";

export type SheetMotionTiming = {
  /** Duração da transição entre estágios (ms); a View passa `motion.durationMedium`. */
  duration: number;
  /** Curva cúbica de Bézier; a View passa `motion.easingStandard`. */
  easing: readonly [number, number, number, number];
};

export type ActivitySheetMotionOptions = {
  stage: FocusSheetStage;
  geometry: SheetGeometryConfig;
  reduceMotion: boolean;
  timing: SheetMotionTiming;
  onStageChange: (stage: FocusSheetStage) => void;
};

/** Lógica do gesto do painel. Não importa a View: geometria e tempos chegam por parâmetro. */
export const useActivitySheetMotionViewModel = ({
  stage,
  geometry,
  reduceMotion,
  timing,
  onStageChange,
}: ActivitySheetMotionOptions) => {
  const { sceneHeight, expandedTop, collapsedHeight } = geometry;
  const snaps = useMemo(
    () => createSheetSnapPoints({ sceneHeight, expandedTop, collapsedHeight }),
    [collapsedHeight, expandedTop, sceneHeight],
  );
  const [top] = useState(() => new Animated.Value(snaps[stage]));
  const [dragging, setDragging] = useState(false);
  const startTop = useRef(0);
  const scrollOffset = useRef(0);
  const startedAtScrollTop = useRef(true);
  const startedOnHandle = useRef(false);
  const [x1, y1, x2, y2] = timing.easing;

  const animateTo = useCallback(
    (target: FocusSheetStage) => {
      const animation = Animated.timing(top, {
        toValue: snaps[target],
        duration: reduceMotion ? 0 : timing.duration,
        easing: Easing.bezier(x1, y1, x2, y2),
        useNativeDriver: false,
      });
      animation.start();
      return animation;
    },
    [reduceMotion, snaps, timing.duration, top, x1, x2, y1, y2],
  );

  useEffect(() => {
    const animation = animateTo(stage);
    return () => animation.stop();
  }, [animateTo, stage]);

  const onScrollOffsetChange = useCallback((offset: number) => {
    scrollOffset.current = Math.max(0, offset);
  }, []);
  const onHandleTouchStart = useCallback(() => {
    startedOnHandle.current = true;
  }, []);

  const settle = useCallback(
    (gesture: PanResponderGestureState) => {
      const target = resolveSheetRelease(stage, startTop.current, gesture.dy, gesture.vy, snaps);
      setDragging(false);
      animateTo(target);
      if (target !== stage) onStageChange(target);
    },
    [animateTo, onStageChange, snaps, stage],
  );
  const onTouchCapture = useCallback(() => {
    startedOnHandle.current = false;
    startedAtScrollTop.current = scrollOffset.current <= 1;
    return false;
  }, []);
  const shouldCapture = useCallback(
    (gesture: PanResponderGestureState) => {
      if (
        Math.abs(gesture.dy) <= SHEET_GESTURE.activationDistance ||
        Math.abs(gesture.dy) <= Math.abs(gesture.dx)
      )
        return false;
      if (startedOnHandle.current) return true;
      if (!startedAtScrollTop.current) return false;
      return gesture.dy > 0 || stage === "stage1_1";
    },
    [stage],
  );
  const onGrant = useCallback(() => {
    top.stopAnimation((value) => {
      startTop.current = value;
    });
    setDragging(true);
  }, [top]);
  const onMove = useCallback(
    (gesture: PanResponderGestureState) => {
      top.setValue(clampSheetTop(startTop.current + gesture.dy, snaps));
    },
    [snaps, top],
  );
  const onTerminate = useCallback(() => {
    setDragging(false);
    animateTo(stage);
  }, [animateTo, stage]);

  // A fábrica apenas registra callbacks; as refs são lidas nos eventos, após o render.
  /* eslint-disable react-hooks/refs */
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: onTouchCapture,
        onMoveShouldSetPanResponderCapture: (_, gesture) => shouldCapture(gesture),
        onPanResponderGrant: onGrant,
        onPanResponderMove: (_, gesture) => onMove(gesture),
        onPanResponderRelease: (_, gesture) => settle(gesture),
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: onTerminate,
        onShouldBlockNativeResponder: () => true,
      }),
    [onGrant, onMove, onTerminate, onTouchCapture, settle, shouldCapture],
  );
  /* eslint-enable react-hooks/refs */

  const artworkShift = top.interpolate({
    inputRange: [snaps.stage1_2, snaps.stage1_1, snaps.collapsed],
    outputRange: [
      sceneHeight * ARTWORK_OFFSET_RATIO.stage1_2,
      sceneHeight * ARTWORK_OFFSET_RATIO.stage1_1,
      sceneHeight * ARTWORK_OFFSET_RATIO.collapsed,
    ],
    extrapolate: "clamp",
  });

  return {
    top,
    artworkShift,
    dragging,
    panHandlers: responder.panHandlers,
    onScrollOffsetChange,
    onHandleTouchStart,
  };
};
