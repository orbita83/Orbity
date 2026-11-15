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
import type { HomeSummary } from "../model/entities/home-summary";
import type { FocusSheetStage } from "../viewmodel/ActivitySheetGeometry";
import { useActivitySheetMotionViewModel } from "../viewmodel/ActivitySheetMotionViewModel";
import type { HomeState } from "../viewmodel/HomeViewModel";
import { CosmicStarfield } from "./components/CosmicStarfield";
import { FocusBottomSheet } from "./components/FocusBottomSheet";
import { MaterialSymbol } from "./components/material-symbol";
import { PlanetStreakView } from "./components/PlanetStreakView";
import { PrimaryButton } from "./components/primary-button";
import { HOME_COPY } from "./home-copy";
import { cosmicBorders, cosmicColors, themes } from "./theme/tokens";

const theme = themes.cosmic;

// Constantes de layout do protótipo do Claude Design (cena de 390 × 756 dp, sem a barra de abas).
/** Centro vertical do planeta recolhido, como fração da altura da cena (356 / 756). */
const PLANET_CENTER_RATIO = 0.471;
/** Lado do planeta recolhido, como fração da largura (320 / 390). */
const PLANET_WIDTH_RATIO = 0.82;
/** Limite do lado do planeta em telas baixas, como fração da altura da cena. */
const PLANET_MAX_HEIGHT_RATIO = 0.42;
/** Arraste mínimo (dp) no cenário para abrir ou reduzir o painel. */
const HERO_SWIPE_DISTANCE = theme.space.lg;
/** Altura do cabeçalho: respiro de cima, botão de Configurações e respiro até o painel aberto. */
const HEADER_HEIGHT = theme.space.lg + theme.target.minSize + theme.space.sm;

export type HomeScreenContentProps = {
  status: HomeState["status"];
  error: HomeState["error"];
  summary: HomeSummary | null;
  progressLabel: string;
  sheetStage: FocusSheetStage;
  reduceMotion: boolean;
  onRetry: () => void;
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
  sheetStage,
  reduceMotion,
  onRetry,
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
  const expandedTop = insets.top + HEADER_HEIGHT;

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

  // Toque e arraste no cenário passam por um único responder. Com um Pressable por cima, ele
  // sobrescrevia os handlers do gesto (o arraste não chegava) e, na web, o clique do mouse
  // ainda disparava o toque depois de um arraste, abrindo dois estágios de uma vez.
  const heroPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -HERO_SWIPE_DISTANCE) onExpandSheet();
          else if (gesture.dy > HERO_SWIPE_DISTANCE) onReduceSheet();
          else if (Math.abs(gesture.dx) < theme.space.sm && Math.abs(gesture.dy) < theme.space.sm) onExpandSheet();
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
  const planetSize = Math.min(width * PLANET_WIDTH_RATIO, sceneHeight * PLANET_MAX_HEIGHT_RATIO);
  const planetTop = sceneHeight * PLANET_CENTER_RATIO - planetSize / 2;

  return (
    <View style={styles.screen} onLayout={onLayout}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {width > 0 ? <CosmicStarfield width={width} height={sceneHeight} /> : null}
      </View>

      {ready ? (
        <View testID="home-hero" {...heroPan.panHandlers} style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[
              styles.planet,
              {
                top: planetTop,
                opacity: sheetMotion.artworkOpacity,
                transform: [{ translateY: sheetMotion.artworkShift }, { scale: sheetMotion.artworkScale }],
              },
            ]}
          >
            {width > 0 ? <PlanetStreakView days={summary.streak.currentDays} size={planetSize} /> : null}
          </Animated.View>
        </View>
      ) : null}

      <View style={[styles.header, { top: insets.top }]}>
        <Text accessibilityRole="header" allowFontScaling style={styles.brand}>
          {HOME_COPY.brand}
        </Text>
        {/* A tela de Configurações ainda não existe: o botão aparece, mas não navega. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={HOME_COPY.settings}
          accessibilityState={{ disabled: true }}
          disabled
          style={styles.settings}
        >
          <MaterialSymbol name="settings" filled color={cosmicColors.focus} size={theme.navbar.iconSize} />
        </Pressable>
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
          <MaterialSymbol name="expand_less" color={theme.color["on-surface-variant"]} size={theme.navbar.iconSize} />
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
    paddingTop: theme.space.lg,
    paddingHorizontal: theme.space.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { ...theme.font.title, color: theme.color["on-surface"] },
  settings: {
    width: theme.target.minSize,
    height: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: cosmicColors.sheet,
  },
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
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.target.minSize,
    paddingHorizontal: theme.space.lg,
    gap: theme.primitive["space-4"],
    borderRadius: theme.radius.md,
  },
  inviteLabel: { ...theme.font.label, color: theme.color["on-surface-variant"] },
  pressed: { opacity: theme.motion.opacityPressed },
  sheetPosition: { position: "absolute", bottom: 0, left: 0, right: 0, overflow: "hidden" },
});
