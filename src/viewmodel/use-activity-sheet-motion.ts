import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, PanResponder, type PanResponderGestureState } from "react-native";
import { cosmicTokens as t } from "../view/theme/tokens";
import { clampSheetTop, createSheetSnapPoints, resolveSheetRelease } from "./activity-sheet-geometry";
import type { FocusSheetStage } from "./use-home-view-model";

type ActivitySheetMotionOptions = {
  stage: FocusSheetStage;
  sceneHeight: number;
  expandedTop: number;
  reducedMotion: boolean;
  onStageChange: (stage: FocusSheetStage) => void;
};

export const useActivitySheetMotion = ({
  stage,
  sceneHeight,
  expandedTop,
  reducedMotion,
  onStageChange,
}: ActivitySheetMotionOptions) => {
  const snaps = useMemo(() => createSheetSnapPoints(sceneHeight, expandedTop), [expandedTop, sceneHeight]);
  const [top] = useState(() => new Animated.Value(snaps[stage]));
  const [dragging, setDragging] = useState(false);
  const startTop = useRef(0);
  const scrollOffset = useRef(0);
  const startedAtScrollTop = useRef(true);
  const startedOnHandle = useRef(false);

  const animateTo = useCallback((target: FocusSheetStage) => {
    const animation = Animated.timing(top, {
      toValue: snaps[target],
      duration: reducedMotion ? 0 : t.motion.sheetDuration,
      easing: Easing.bezier(0.22, 0.8, 0.25, 1),
      useNativeDriver: false,
    });
    animation.start();
    return animation;
  }, [reducedMotion, snaps, top]);

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

  const settle = useCallback((gesture: PanResponderGestureState) => {
    const target = resolveSheetRelease(stage, startTop.current, gesture.dy, gesture.vy, snaps);
    setDragging(false);
    animateTo(target);
    if (target !== stage) onStageChange(target);
  }, [animateTo, onStageChange, snaps, stage]);
  const onTouchCapture = useCallback(() => {
    startedOnHandle.current = false;
    startedAtScrollTop.current = scrollOffset.current <= 1;
    return false;
  }, []);
  const shouldCapture = useCallback((gesture: PanResponderGestureState) => {
    if (Math.abs(gesture.dy) <= t.sheetGesture.activationDistance ||
      Math.abs(gesture.dy) <= Math.abs(gesture.dx)) return false;
    if (startedOnHandle.current) return true;
    if (!startedAtScrollTop.current) return false;
    return gesture.dy > 0 || stage === "stage1_1";
  }, [stage]);
  const onGrant = useCallback(() => {
    top.stopAnimation((value) => { startTop.current = value; });
    setDragging(true);
  }, [top]);
  const onMove = useCallback((gesture: PanResponderGestureState) => {
    top.setValue(clampSheetTop(startTop.current + gesture.dy, snaps));
  }, [snaps, top]);
  const onTerminate = useCallback(() => {
    setDragging(false);
    animateTo(stage);
  }, [animateTo, stage]);

  // A fábrica apenas registra callbacks; as refs são lidas nos eventos, após o render.
  // eslint-disable-next-line react-hooks/refs
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponderCapture: onTouchCapture,
    onMoveShouldSetPanResponderCapture: (_, gesture) => shouldCapture(gesture),
    onPanResponderGrant: onGrant,
    onPanResponderMove: (_, gesture) => onMove(gesture),
    onPanResponderRelease: (_, gesture) => settle(gesture),
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: onTerminate,
    onShouldBlockNativeResponder: () => true,
  }), [onGrant, onMove, onTerminate, onTouchCapture, settle, shouldCapture]);

  const artworkShift = top.interpolate({
    inputRange: [snaps.stage1_2, snaps.stage1_1, snaps.collapsed],
    outputRange: [
      sceneHeight * t.layout.expandedArtworkOffset,
      sceneHeight * t.layout.intermediateArtworkOffset,
      0,
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
