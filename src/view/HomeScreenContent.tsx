import { useEffect, useMemo, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { FocusDuration } from "../model/entities/focus-duration";
import type { HomeSummary } from "../model/entities/home-summary";
import type { FocusSheetStage } from "../viewmodel/ActivitySheetGeometry";
import { useActivitySheetMotionViewModel } from "../viewmodel/ActivitySheetMotionViewModel";
import type { HomeState } from "../viewmodel/HomeViewModel";
import { CosmicIcon } from "./components/CosmicIcon";
import { CosmicStarfield } from "./components/CosmicStarfield";
import { FocusBottomSheet } from "./components/FocusBottomSheet";
import { PLANET_ASPECT_RATIO } from "./components/PlanetIllustration";
import { PlanetStreakView } from "./components/PlanetStreakView";
import { PrimaryButton } from "./components/primary-button";
import { HOME_COPY } from "./home-copy";
import { cosmicColors, themes } from "./theme/tokens";

const theme = themes.cosmic;

/** Centro vertical do planeta, como fração da altura da cena (constante de layout do protótipo). */
const PLANET_CENTER_RATIO = 0.465;
/** Arraste mínimo (dp) no cenário para abrir ou reduzir o painel. */
const HERO_SWIPE_DISTANCE = theme.space.lg;

export type HomeScreenContentProps = {
  status: HomeState["status"];
  error: HomeState["error"];
  summary: HomeSummary | null;
  progressLabel: string;
  selectedDuration: FocusDuration;
  sheetStage: FocusSheetStage;
  reduceMotion: boolean;
  onRetry: () => void;
  onSelectDuration: (duration: FocusDuration) => void;
  onCycleSheetStage: () => void;
  onCollapseSheet: () => void;
  onExpandSheet: () => void;
  onReduceSheet: () => void;
  onSetSheetStage: (stage: FocusSheetStage) => void;
};

/** Tela Início só de apresentação: estado e ações chegam por props (testes e histórias). */
export const HomeScreenContent = ({
  status,
  error,
  summary,
  progressLabel,
  selectedDuration,
  sheetStage,
  reduceMotion,
  onRetry,
  onSelectDuration,
  onCycleSheetStage,
  onCollapseSheet,
  onExpandSheet,
  onReduceSheet,
  onSetSheetStage,
}: HomeScreenContentProps) => {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  // Até o primeiro onLayout, usa a janela como estimativa.
  const width = frame.width || window.width;
  const sceneHeight = frame.height || window.height;
  const expanded = sheetStage === "stage1_2";
  const expandedTop = insets.top + theme.target.minSize;

  const sheetMotion = useActivitySheetMotionViewModel({
    stage: sheetStage,
    geometry: { sceneHeight, expandedTop, collapsedHeight: 0 },
    reduceMotion,
    timing: { duration: theme.motion.durationMedium, easing: theme.motion.easingStandard },
    onStageChange: onSetSheetStage,
  });

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCollapseSheet();
    };
    globalThis.addEventListener("keydown", handleKey);
    return () => globalThis.removeEventListener("keydown", handleKey);
  }, [onCollapseSheet]);

  const heroPan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > theme.space.sm && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -HERO_SWIPE_DISTANCE) onExpandSheet();
          else if (gesture.dy > HERO_SWIPE_DISTANCE) onReduceSheet();
        },
      }),
    [onExpandSheet, onReduceSheet],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;
    setFrame((current) =>
      current.width === nextWidth && current.height === nextHeight ? current : { width: nextWidth, height: nextHeight },
    );
  };

  const ready = status === "ready" && summary !== null;
  const planetTop = sceneHeight * PLANET_CENTER_RATIO - (width * PLANET_ASPECT_RATIO) / 2;

  return (
    <View style={styles.screen} onLayout={onLayout}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {width > 0 ? <CosmicStarfield width={width} height={sceneHeight} /> : null}
      </View>

      {ready ? (
        <Pressable
          {...heroPan.panHandlers}
          accessible={false}
          onPress={onExpandSheet}
          style={StyleSheet.absoluteFill}
        >
          <Animated.View style={[styles.planet, { top: planetTop, transform: [{ translateY: sheetMotion.artworkShift }] }]}>
            {width > 0 ? <PlanetStreakView days={summary.streak.currentDays} size={width} /> : null}
          </Animated.View>
        </Pressable>
      ) : null}

      <View style={[styles.header, { top: insets.top, height: expanded ? theme.target.minSize : theme.size.headerHeight }]}>
        <Text accessibilityRole="header" allowFontScaling style={styles.brand}>
          {HOME_COPY.brand}
        </Text>
      </View>

      {status === "loading" ? (
        <View accessible accessibilityLabel={HOME_COPY.loading} style={styles.center} />
      ) : null}

      {status === "error" && error ? (
        <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.center}>
          <View style={styles.errorCard}>
            <Text allowFontScaling style={styles.errorText}>
              {HOME_COPY[error.messageKey]}
            </Text>
            {error.retryable ? <PrimaryButton theme={theme} label={HOME_COPY["error.retry"]} onPress={onRetry} /> : null}
          </View>
        </View>
      ) : null}

      {ready && sheetStage === "collapsed" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={HOME_COPY["sheet.open"]}
          onPress={onExpandSheet}
          style={({ pressed }) => [styles.invite, pressed && styles.pressed]}
        >
          <CosmicIcon name="up" color={cosmicColors.unlocked} size={theme.size.iconLg} />
          <Text allowFontScaling style={styles.inviteLabel}>
            {HOME_COPY["sheet.invite"]}
          </Text>
        </Pressable>
      ) : null}

      {ready ? (
        <Animated.View
          {...sheetMotion.panHandlers}
          pointerEvents={sheetStage === "collapsed" ? "none" : "auto"}
          accessibilityElementsHidden={sheetStage === "collapsed"}
          importantForAccessibility={sheetStage === "collapsed" ? "no-hide-descendants" : "auto"}
          style={[styles.sheetPosition, { top: sheetMotion.top }]}
        >
          <FocusBottomSheet
            stage={sheetStage}
            progressLabel={progressLabel}
            progressRatio={summary.progress.ratio}
            progressCompleted={summary.progress.completed}
            progressTotal={summary.progress.total}
            focus={summary.focus}
            selectedDuration={selectedDuration}
            onSelectDuration={onSelectDuration}
            onToggleStage={onCycleSheetStage}
            onCollapseSheet={onCollapseSheet}
            dragging={sheetMotion.dragging}
            onScrollOffsetChange={sheetMotion.onScrollOffsetChange}
            onHandleTouchStart={sheetMotion.onHandleTouchStart}
          />
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.surface, overflow: "hidden" },
  planet: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: theme.space.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  brand: { ...theme.font.brand, color: theme.color["on-surface"] },
  center: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", padding: theme.space.lg },
  errorCard: {
    alignSelf: "stretch",
    gap: theme.space.md,
    padding: theme.space.lg,
    borderRadius: theme.radius.lg,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color["border-subtle"],
    backgroundColor: theme.color["surface-variant"],
  },
  errorText: { ...theme.font.body, color: theme.color["on-surface"], textAlign: "center" },
  invite: {
    position: "absolute",
    bottom: theme.space.lg,
    left: theme.primitive["space-32"],
    right: theme.primitive["space-32"],
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.target.minSize,
    gap: theme.space.sm,
  },
  inviteLabel: { ...theme.font.caption, color: theme.color.focus },
  pressed: { opacity: theme.motion.opacityPressed },
  sheetPosition: { position: "absolute", bottom: 0, left: 0, right: 0, overflow: "hidden" },
});
