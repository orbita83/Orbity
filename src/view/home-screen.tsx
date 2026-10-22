import { useEffect, useMemo, useState } from "react";
import { Animated, PanResponder, Platform, Pressable, StyleSheet, Switch, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import { makeHomeUseCases } from "../di/home-factory";
import type { HomeDashboardData } from "../model/entities/home-dashboard";
import { useHomeViewModel, type FocusSheetStage } from "../viewmodel/use-home-view-model";
import { useReducedMotion } from "../viewmodel/use-reduced-motion";
import { useActivitySheetMotion } from "../viewmodel/use-activity-sheet-motion";
import { CosmicIcon } from "./components/cosmic-icon";
import { CosmicStarfield } from "./components/cosmic-starfield";
import { FocusBottomSheet } from "./components/focus-bottom-sheet";
import { HomeDialog } from "./components/home-dialog";
import { NavBar } from "./components/nav-bar";
import { PlanetStreakView } from "./components/planet-streak-view";
import { cosmicTokens as t } from "./theme/tokens";

export type HomeScreenProps = {
  initialData?: HomeDashboardData;
  initialLoading?: boolean;
  initialStage?: FocusSheetStage;
  initialFocusMode?: boolean;
  previewWidth?: number;
  previewHeight?: number;
  showPreviewChrome?: boolean;
};

type HomeDialogId = "settings" | "help" | "session" | "achievements" | null;

const PreviewStatusBar = () => (
  <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.statusBar}>
    <Text style={styles.clock}>9:41</Text>
    <Svg width={76} height={18} viewBox="0 0 76 18" fill={t.color.text}>
      <Rect x="1" y="11" width="3" height="5" rx="0.7" /><Rect x="6" y="8" width="3" height="8" rx="0.7" /><Rect x="11" y="5" width="3" height="11" rx="0.7" /><Rect x="16" y="2" width="3" height="14" rx="0.7" />
      <Path d="M27 6a12 12 0 0 1 18 0l-2 2a9 9 0 0 0-14 0Zm4 4a7 7 0 0 1 10 0l-2 2a4 4 0 0 0-6 0Zm3 4 2-2 2 2-2 2Z" />
      <Rect x="52" y="3" width="21" height="12" rx="2.5" fill="none" stroke={t.color.muted} /><Rect x="54" y="5" width="17" height="8" rx="1" /><Rect x="74" y="7" width="2" height="4" rx="1" />
    </Svg>
  </View>
);

const HomeScreen = ({ initialData, initialLoading = false, initialStage = "collapsed", initialFocusMode = false, previewWidth, previewHeight, showPreviewChrome = true }: HomeScreenProps = {}) => {
  const homeUseCases = useMemo(() => makeHomeUseCases(initialData), [initialData]);
  const vm = useHomeViewModel(homeUseCases, { initialData, initialLoading, initialStage, initialFocusMode });
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const systemReducedMotion = useReducedMotion();
  const [localReducedMotion, setLocalReducedMotion] = useState(false);
  const [dialog, setDialog] = useState<HomeDialogId>(null);
  const [settingsFocused, setSettingsFocused] = useState(false);
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState<string | null>(null);
  const toast = vm.statusAnnouncement !== dismissedAnnouncement ? vm.statusAnnouncement : null;
  const reducedMotion = systemReducedMotion || localReducedMotion;

  const framed = Platform.OS === "web" && (window.width >= t.layout.desktopBreakpoint || previewWidth !== undefined);
  const frameWidth = previewWidth ?? Math.min(window.width || t.layout.maxWidth, t.layout.maxWidth);
  const viewportHeight = window.height || t.layout.maxHeight;
  const frameHeight = previewHeight ?? (framed ? Math.max(320, Math.min(viewportHeight - t.layout.desktopInset * 2, t.layout.maxHeight)) : viewportHeight);
  const bottomInset = Platform.OS === "web" ? 0 : insets.bottom;
  const sceneHeight = frameHeight - (vm.isNavBarVisible ? t.layout.navHeight + bottomInset : bottomInset);
  const statusHeight = Platform.OS === "web" ? showPreviewChrome ? t.layout.statusHeight : 0 : insets.top;
  const expandedTop = statusHeight + t.layout.compactHeaderHeight;
  const sheetMotion = useActivitySheetMotion({
    stage: vm.sheetStage,
    sceneHeight,
    expandedTop,
    reducedMotion,
    onStageChange: vm.handleSetSheetStage,
  });
  const lastSession = vm.dashboard.lastSession;
  const lastSessionLabel = lastSession ? `${lastSession.minutes} minutos • ${lastSession.completedAtLabel}` : "Seu próximo momento de foco espera por você.";
  const layoutStyles = createLayoutStyles(frameWidth, frameHeight, sceneHeight, statusHeight, previewWidth !== undefined, framed, vm.sheetStage === "stage1_2");

  useEffect(() => {
    if (!vm.statusAnnouncement) return;
    const timeout = setTimeout(() => setDismissedAnnouncement(vm.statusAnnouncement), 4000);
    return () => clearTimeout(timeout);
  }, [vm.statusAnnouncement]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dialog === null && vm.selectedAchievement === null) vm.handleCollapseSheet();
    };
    globalThis.addEventListener("keydown", handleKey);
    return () => globalThis.removeEventListener("keydown", handleKey);
  }, [dialog, vm]);

  const { handleExpandSheet, handleReduceSheet } = vm;
  const heroPan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 12 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy < -24) handleExpandSheet();
      else if (gesture.dy > 24) handleReduceSheet();
    },
  }), [handleExpandSheet, handleReduceSheet]);

  const closeDialog = () => {
    setDialog(null);
    vm.handleSelectAchievement(null);
  };
  const dialogTitle = vm.selectedAchievement ? `${vm.selectedAchievement.label} · ${vm.selectedAchievement.unlocked ? "Conquistada" : "Sua próxima conquista"}` : dialog === "settings" ? "Seu espaço, no seu ritmo" : dialog === "session" ? "Última sessão" : dialog === "achievements" ? "Suas conquistas" : "Como funciona?";
  const dialogBody = vm.selectedAchievement?.description ?? (dialog === "settings" ? "Personalize seu momento de estudo. Cada pequeno passo faz parte da sua trajetória." : dialog === "session" ? lastSessionLabel : dialog === "achievements" ? "Cada marco celebra um pouco da sua jornada. Toque em uma conquista para conhecer seu significado." : "Reserve um momento para estudar e inicie o modo foco. O tempo estudado preenche sua meta diária e faz parte da sua sequência. Suas conquistas continuam com você, mesmo quando precisar de uma pausa.");

  return (
    <View style={layoutStyles.stage}>
      <View style={[styles.phone, layoutStyles.phone, framed && styles.phoneFrame]}>
        <View style={layoutStyles.scene}>
          <Pressable {...heroPan.panHandlers} accessibilityRole="button" accessibilityLabel={`${vm.dashboard.streakDays} dias de sequência`} accessibilityHint="Deslize para cima ou toque para explorar o painel de foco" onPress={vm.handleExpandSheet} style={StyleSheet.absoluteFill}>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <CosmicStarfield width={frameWidth} height={sceneHeight} />
            </View>
            <Animated.View pointerEvents="none" style={[layoutStyles.planetViewer, { transform: [{ translateY: sheetMotion.artworkShift }] }]}>
              <PlanetStreakView size={frameWidth} streakDays={vm.dashboard.streakDays} stageDescription={vm.dashboard.planetStageName} isFocusMode={vm.isFocusMode} />
            </Animated.View>
          </Pressable>

          {Platform.OS === "web" && showPreviewChrome ? <PreviewStatusBar /> : null}
          <View style={layoutStyles.header}>
            <Text accessibilityRole="header" allowFontScaling style={styles.brand}>Orbity</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Configurações de estudo" onPress={() => setDialog("settings")} onFocus={() => setSettingsFocused(true)} onBlur={() => setSettingsFocused(false)} style={({ pressed }) => [styles.settingsButton, settingsFocused && styles.focused, pressed && styles.pressed]}><CosmicIcon name="settings" color={t.color.muted} size={24} /></Pressable>
          </View>

          {vm.sheetStage === "collapsed" ? <Pressable accessibilityRole="button" accessibilityLabel="Deslize para explorar" accessibilityHint="Abre o painel de foco e progresso" onPress={vm.handleExpandSheet} style={({ pressed }) => [styles.explore, pressed && styles.pressed]}><CosmicIcon name="up" color={t.color.unlocked} size={30} /><Text allowFontScaling style={styles.exploreLabel}>Deslize para explorar</Text></Pressable> : null}

          <Animated.View {...sheetMotion.panHandlers} pointerEvents={vm.sheetStage === "collapsed" ? "none" : "auto"} accessibilityElementsHidden={vm.sheetStage === "collapsed"} importantForAccessibility={vm.sheetStage === "collapsed" ? "no-hide-descendants" : "auto"} style={[styles.sheetPosition, { top: sheetMotion.top }]}>
            <FocusBottomSheet stage={vm.sheetStage} dailyProgress={vm.dashboard.dailyProgress} achievements={vm.dashboard.achievements} isFocusMode={vm.isFocusMode} loading={vm.loading} onToggleStage={vm.handleCycleSheetStage} onCollapseSheet={vm.handleCollapseSheet} onExpandSheet={vm.handleExpandSheet} onToggleFocus={vm.handleToggleFocusMode} onOpenAchievements={() => setDialog("achievements")} onSelectAchievement={vm.handleSelectAchievement} onOpenLastSession={() => setDialog("session")} onOpenHelp={() => setDialog("help")} lastSessionLabel={lastSessionLabel} focusTimerLabel={vm.focusTimerLabel} dragging={sheetMotion.dragging} onScrollOffsetChange={sheetMotion.onScrollOffsetChange} onHandleTouchStart={sheetMotion.onHandleTouchStart} />
          </Animated.View>

          {toast || vm.error ? <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.toast}><Text allowFontScaling style={styles.toastLabel}>{vm.error ?? toast}</Text></View> : null}
        </View>
        <NavBar appearance="cosmic" activeTab={vm.activeTab} onSelectTab={vm.handleSelectTab} visible={vm.isNavBarVisible} bottomInset={bottomInset} />
        {!vm.isNavBarVisible && bottomInset > 0 ? <View style={{ height: bottomInset }} /> : null}
        <HomeDialog visible={dialog !== null || vm.selectedAchievement !== null} title={dialogTitle} body={dialogBody} onClose={closeDialog}>
          {dialog === "settings" ? <View style={styles.preference}><View style={styles.preferenceText}><Text allowFontScaling style={styles.preferenceTitle}>Reduzir movimento</Text><Text allowFontScaling style={styles.preferenceBody}>{systemReducedMotion ? "Preferência do seu dispositivo ativada." : "Transições suaves, sem deslocamento."}</Text></View><Switch accessibilityLabel="Reduzir movimento" value={reducedMotion} onValueChange={setLocalReducedMotion} disabled={systemReducedMotion} trackColor={{ false: t.color.track, true: t.color.action }} thumbColor={t.color.text} /></View> : null}
          {dialog === "achievements" ? vm.dashboard.achievements.map((achievement) => <Pressable key={achievement.id} accessibilityRole="button" onPress={() => { setDialog(null); vm.handleSelectAchievement(achievement); }} style={styles.achievementRow}><CosmicIcon name={achievement.unlocked ? "check" : "lock"} /><View style={styles.preferenceText}><Text allowFontScaling style={styles.preferenceTitle}>{achievement.label}</Text><Text allowFontScaling style={styles.preferenceBody}>{achievement.description}</Text></View></Pressable>) : null}
        </HomeDialog>
      </View>
    </View>
  );
};

export default HomeScreen;

const createLayoutStyles = (width: number, height: number, sceneHeight: number, statusHeight: number, isolated: boolean, framed: boolean, expanded: boolean) => StyleSheet.create({
  stage: { alignItems: "center", justifyContent: "center", backgroundColor: t.color.desktop, width: isolated ? width : "100%", height: isolated ? height : undefined, flex: isolated ? undefined : 1, minHeight: isolated ? height : height + (framed ? t.layout.desktopInset * 2 : 0) },
  phone: { width, height },
  scene: { height: sceneHeight, overflow: "hidden" },
  header: { position: "absolute", left: 0, right: 0, top: statusHeight, height: expanded ? t.layout.compactHeaderHeight : t.layout.headerHeight, paddingHorizontal: t.space.xxl, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planetViewer: { position: "absolute", left: 0, right: 0, alignItems: "center", top: sceneHeight * t.layout.planetLabelTop - width * t.planet.aspectRatio / 2 },
});

const styles = StyleSheet.create({
  phone: { backgroundColor: t.color.background, overflow: "hidden" },
  phoneFrame: { borderWidth: t.border.sheet, borderColor: t.color.sheetBorder, borderRadius: t.radius.phone, boxShadow: "0 24px 90px rgba(0, 0, 0, 0.4)" },
  statusBar: { height: t.layout.statusHeight, position: "absolute", left: t.space.section, right: t.space.xl, top: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  clock: { ...t.font.status, color: t.color.text },
  brand: { ...t.font.brand, color: t.color.text },
  settingsButton: { minWidth: t.layout.touchTarget, minHeight: t.layout.touchTarget, alignItems: "center", justifyContent: "center", borderRadius: t.radius.button, borderColor: t.color.transparent, borderWidth: t.border.focus, marginRight: -t.space.md },
  focused: { borderColor: t.color.focus },
  pressed: { opacity: t.motion.pressedOpacity },
  explore: { position: "absolute", bottom: t.space.xxl, left: t.space.section, right: t.space.section, alignItems: "center", justifyContent: "center", minHeight: 64, gap: t.space.sm },
  exploreLabel: { ...t.font.caption, color: t.color.focus },
  sheetPosition: { position: "absolute", bottom: 0, left: 0, right: 0, overflow: "hidden" },
  toast: { position: "absolute", bottom: t.space.lg, left: t.space.lg, right: t.space.lg, backgroundColor: t.color.toast, borderRadius: t.radius.card, borderWidth: t.border.subtle, borderColor: t.color.sheetBorder, padding: t.space.lg },
  toastLabel: { ...t.font.body, color: t.color.text },
  preference: { flexDirection: "row", alignItems: "center", gap: t.space.md },
  preferenceText: { flex: 1, gap: t.space.xs },
  preferenceTitle: { ...t.font.title, color: t.color.text },
  preferenceBody: { ...t.font.body, color: t.color.muted },
  achievementRow: { flexDirection: "row", gap: t.space.lg, alignItems: "center", minHeight: t.layout.touchTarget, paddingVertical: t.space.sm },
});
