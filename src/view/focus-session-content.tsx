import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CYCLES_BEFORE_LONG_BREAK,
  FOCUS_DURATIONS,
  LONG_BREAK_MINUTES,
  SHORT_BREAK_MINUTES,
  type FocusDuration,
  type FocusSessionActions,
  type FocusSessionState,
  type FocusTarget,
} from "../viewmodel/useFocusSessionViewModel";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CosmicStarfield } from "./components/CosmicStarfield";
import { GradientSurface } from "./components/GradientSurface";
import { MaterialSymbol } from "./components/MaterialSymbol";
import { PlanetStreakView } from "./components/PlanetStreakView";
import { PrimaryButton } from "./components/PrimaryButton";
import { ScreenHeader } from "./components/ScreenHeader";
import { SkeletonCards } from "./components/SkeletonCards";
import {
  FOCUS_COPY,
  formatFocusAnnouncement,
  formatFocusCopy,
  nextPhaseCtaLabel,
} from "./focusCopy";
import { cosmicBorders, cosmicColors, cosmicGradients, themes } from "./theme/tokens";

const theme = themes.cosmic;
const PLANET_WIDTH_RATIO = 0.54;
const PLANET_MAX_SIZE = theme.size.dialogIcon * 2 + theme.space.lg;

export type FocusSessionScreenContentProps = FocusSessionState &
  Omit<FocusSessionActions, "handleBack"> & {
    readonly reduceMotion: boolean;
    readonly onBack: () => void;
  };

const TargetOption = ({
  target,
  selected,
  onSelect,
}: {
  target: FocusTarget;
  selected: boolean;
  onSelect: () => void;
}) => {
  const kindLabel =
    target.kind === "routine"
      ? FOCUS_COPY["targets.kind.routine"]
      : FOCUS_COPY["targets.kind.task"];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${target.title}, ${kindLabel}`}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.targetOption,
        selected && styles.targetOptionSelected,
        pressed && styles.pressed,
      ]}
    >
      <MaterialSymbol
        name={target.kind === "routine" ? "autorenew" : "assignment"}
        color={selected ? cosmicColors.focus : theme.color["on-surface-variant"]}
        size={theme.navbar.iconSize}
      />
      <View style={styles.targetTexts}>
        <Text allowFontScaling style={styles.targetTitle}>
          {target.title}
        </Text>
        <Text allowFontScaling style={styles.targetKind}>
          {kindLabel}
        </Text>
      </View>
      <MaterialSymbol
        name={selected ? "check_circle" : "chevron_right"}
        filled={selected}
        color={selected ? cosmicColors.focus : cosmicColors.inactive}
        size={theme.navbar.iconSize}
      />
    </Pressable>
  );
};

const DurationOption = ({
  minutes,
  selected,
  onSelect,
}: {
  minutes: FocusDuration;
  selected: boolean;
  onSelect: () => void;
}) => (
  <Pressable
    accessibilityRole="radio"
    accessibilityState={{ checked: selected }}
    accessibilityLabel={formatFocusCopy("duration.optionA11y", { minutes })}
    onPress={onSelect}
    style={({ pressed }) => [
      styles.durationChip,
      selected && styles.durationChipSelected,
      pressed && styles.pressed,
    ]}
  >
    {selected ? (
      <MaterialSymbol
        name="check"
        color={theme.color["on-surface"]}
        size={theme.space.md}
      />
    ) : null}
    <Text allowFontScaling style={styles.durationLabel}>
      {formatFocusCopy("duration.option", { minutes })}
    </Text>
  </Pressable>
);

/**
 * Apresentação pura da tela do Modo Foco (Pomodoro, RF-0019, RN-0001, RN-0006, EC-0007, issue #217).
 */
export const FocusSessionScreenContent = ({
  loading,
  submitting,
  errorKey,
  validationError,
  permissionNoticeKey,
  targets,
  selectedTarget,
  selectedDuration,
  activeSession,
  lastEndedSession,
  lastEndedFocusedMinutes,
  streakDays,
  timerLabel,
  cycleCompleted,
  phaseProgress,
  planetFocusStage,
  currentCycleInSet,
  totalFocusedMinutes,
  confirmEndVisible,
  announcement,
  reduceMotion,
  onBack,
  reload,
  selectTarget,
  selectDuration,
  start,
  pause,
  resume,
  advanceCycle,
  requestEnd,
  cancelEnd,
  confirmEnd,
  dismissPermissionNotice,
}: FocusSessionScreenContentProps) => {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const [frame, setFrame] = useState({ width: 0, height: 0 });

  const width = frame.width || window.width;
  const height = frame.height || window.height;
  const planetSize = Math.min(width * PLANET_WIDTH_RATIO, PLANET_MAX_SIZE);
  const announcementText = formatFocusAnnouncement(announcement);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;
    setFrame((current) =>
      current.width === nextWidth && current.height === nextHeight
        ? current
        : { width: nextWidth, height: nextHeight },
    );
  };

  const phaseLabel = activeSession
    ? activeSession.phase === "short-break"
      ? formatFocusCopy("phase.shortBreak", { minutes: SHORT_BREAK_MINUTES })
      : activeSession.phase === "long-break"
        ? formatFocusCopy("phase.longBreak", { minutes: LONG_BREAK_MINUTES })
        : formatFocusCopy("phase.focus", {
            cycle: currentCycleInSet,
            total: CYCLES_BEFORE_LONG_BREAK,
          })
    : "";

  const statusLabel = activeSession
    ? cycleCompleted
      ? FOCUS_COPY["status.completed"]
      : activeSession.status === "paused"
        ? FOCUS_COPY["status.paused"]
        : FOCUS_COPY["status.running"]
    : "";

  const progressPercent = Math.round(phaseProgress * 100);
  const startDisabled = targets.length === 0 || !selectedTarget || submitting;

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      onLayout={onLayout}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {width > 0 ? <CosmicStarfield width={width} height={height} /> : null}
      </View>

      {/* Região separada para anúncios discretos em marcos de ciclo (nunca a cada segundo). */}
      <View
        testID="focus-a11y-announcer"
        accessibilityLiveRegion="polite"
        accessible={Boolean(announcementText)}
        style={styles.srOnly}
      >
        {announcementText ? <Text>{announcementText}</Text> : null}
      </View>

      <ScreenHeader
        title={FOCUS_COPY.title}
        backLabel={FOCUS_COPY.back}
        onBack={onBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <SkeletonCards count={3} accessibilityLabel={FOCUS_COPY.loading} />
        ) : errorKey === "error.load" ? (
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.card}
          >
            <GradientSurface
              from={cosmicGradients.card[0]}
              to={cosmicGradients.card[1]}
            />
            <View style={styles.inlineRow}>
              <MaterialSymbol
                name="error"
                color={theme.color.error}
                size={theme.navbar.iconSize}
              />
              <Text allowFontScaling style={styles.errorText}>
                {FOCUS_COPY["error.load"]}
              </Text>
            </View>
            <PrimaryButton
              theme={theme}
              label={FOCUS_COPY["error.retry"]}
              onPress={() => void reload()}
            />
          </View>
        ) : activeSession ? (
          <>
            {permissionNoticeKey === "notice.permission" ? (
              <View style={styles.noticeCard}>
                <View style={styles.inlineRowTop}>
                  <MaterialSymbol
                    name="info"
                    color={cosmicColors.focus}
                    size={theme.navbar.iconSize}
                  />
                  <Text allowFontScaling style={styles.noticeText}>
                    {FOCUS_COPY["notice.permission"]}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={FOCUS_COPY["notice.dismiss"]}
                  onPress={dismissPermissionNotice}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text allowFontScaling style={styles.secondaryButtonLabel}>
                    {FOCUS_COPY["notice.dismiss"]}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.planetContainer}>
              {planetSize > 0 ? (
                <PlanetStreakView
                  days={streakDays}
                  size={planetSize}
                  focusActive
                  focusStage={planetFocusStage}
                  reduceMotion={reduceMotion}
                />
              ) : null}
            </View>

            <View style={styles.card}>
              <GradientSurface
                from={cosmicGradients.card[0]}
                to={cosmicGradients.card[1]}
              />

              <View style={styles.badgesRow}>
                <View style={styles.phaseBadge}>
                  <MaterialSymbol
                    name={activeSession.phase === "focus" ? "timer" : "light_mode"}
                    color={cosmicColors.focus}
                    size={theme.space.md}
                  />
                  <Text allowFontScaling style={styles.badgeText}>
                    {phaseLabel}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text allowFontScaling style={styles.badgeText}>
                    {statusLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.linkedTargetBox}>
                <MaterialSymbol
                  name={
                    activeSession.targetKind === "routine"
                      ? "autorenew"
                      : "assignment"
                  }
                  color={cosmicColors.focus}
                  size={theme.navbar.iconSize}
                />
                <View style={styles.targetTexts}>
                  <Text allowFontScaling style={styles.linkedCaption}>
                    {FOCUS_COPY["session.linkedTo"]}
                  </Text>
                  <Text allowFontScaling style={styles.targetTitle}>
                    {activeSession.targetTitle}
                  </Text>
                </View>
              </View>

              <Text
                testID="focus-timer-display"
                accessibilityRole="timer"
                accessibilityLabel={FOCUS_COPY["session.timerA11y"]}
                allowFontScaling
                style={styles.timerDisplay}
              >
                {timerLabel}
              </Text>

              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={FOCUS_COPY["session.progressLabel"]}
                accessibilityValue={{
                  min: 0,
                  max: 100,
                  now: progressPercent,
                  text: formatFocusCopy("session.progressValue", {
                    percent: progressPercent,
                  }),
                }}
                style={styles.progressTrack}
              >
                {phaseProgress > 0 ? (
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, phaseProgress * 100)}%` },
                    ]}
                  >
                    <GradientSurface
                      from={cosmicGradients.progress[0]}
                      to={cosmicGradients.progress[1]}
                      horizontal
                    />
                  </View>
                ) : null}
              </View>

              <Text allowFontScaling style={styles.focusedSummary}>
                {formatFocusCopy("session.focusedSoFar", {
                  minutes: totalFocusedMinutes,
                })}
              </Text>
            </View>

            {errorKey === "error.action" ? (
              <View accessibilityRole="alert" style={styles.inlineErrorBox}>
                <MaterialSymbol
                  name="error"
                  color={theme.color.error}
                  size={theme.navbar.iconSize}
                />
                <Text allowFontScaling style={styles.errorText}>
                  {FOCUS_COPY["error.action"]}
                </Text>
              </View>
            ) : null}

            <View style={styles.controlsGroup}>
              {cycleCompleted ? (
                <PrimaryButton
                  theme={theme}
                  label={nextPhaseCtaLabel(
                    activeSession.phase,
                    activeSession.completedFocusCycles,
                    CYCLES_BEFORE_LONG_BREAK,
                  )}
                  icon={
                    <MaterialSymbol
                      name="skip_next"
                      filled
                      color={theme.button.label}
                      size={theme.navbar.iconSize}
                    />
                  }
                  disabled={submitting}
                  onPress={() => void advanceCycle()}
                />
              ) : activeSession.status === "running" ? (
                <PrimaryButton
                  theme={theme}
                  label={FOCUS_COPY["controls.pause"]}
                  icon={
                    <MaterialSymbol
                      name="pause"
                      filled
                      color={theme.button.label}
                      size={theme.navbar.iconSize}
                    />
                  }
                  disabled={submitting}
                  onPress={() => void pause()}
                />
              ) : (
                <PrimaryButton
                  theme={theme}
                  label={FOCUS_COPY["controls.resume"]}
                  icon={
                    <MaterialSymbol
                      name="play_arrow"
                      filled
                      color={theme.button.label}
                      size={theme.navbar.iconSize}
                    />
                  }
                  disabled={submitting}
                  onPress={() => void resume()}
                />
              )}

              {!cycleCompleted ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={FOCUS_COPY["controls.advance"]}
                  disabled={submitting}
                  onPress={() => void advanceCycle()}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <MaterialSymbol
                    name="skip_next"
                    color={theme.color["on-surface"]}
                    size={theme.navbar.iconSize}
                  />
                  <Text allowFontScaling style={styles.secondaryButtonLabel}>
                    {FOCUS_COPY["controls.advance"]}
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={FOCUS_COPY["controls.end"]}
                disabled={submitting}
                onPress={requestEnd}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialSymbol
                  name="stop"
                  color={theme.color["on-surface"]}
                  size={theme.navbar.iconSize}
                />
                <Text allowFontScaling style={styles.secondaryButtonLabel}>
                  {FOCUS_COPY["controls.end"]}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.planetContainer}>
              {planetSize > 0 ? (
                <PlanetStreakView
                  days={streakDays}
                  size={planetSize}
                  focusActive={false}
                  focusStage={0}
                  reduceMotion={reduceMotion}
                />
              ) : null}
            </View>

            {lastEndedSession && lastEndedFocusedMinutes !== null ? (
              <View style={styles.lastSessionPill}>
                <MaterialSymbol
                  name="history"
                  color={cosmicColors.focus}
                  size={theme.navbar.iconSize}
                />
                <Text allowFontScaling style={styles.lastSessionText}>
                  {lastEndedFocusedMinutes >= 1
                    ? formatFocusCopy("lastSession.banner", {
                        minutes: lastEndedFocusedMinutes,
                        title: lastEndedSession.targetTitle,
                      })
                    : formatFocusCopy("lastSession.bannerUnderOne", {
                        title: lastEndedSession.targetTitle,
                      })}
                </Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <GradientSurface
                from={cosmicGradients.card[0]}
                to={cosmicGradients.card[1]}
              />
              <Text
                accessibilityRole="header"
                allowFontScaling
                style={styles.sectionTitle}
              >
                {FOCUS_COPY["targets.title"]}
              </Text>
              <Text allowFontScaling style={styles.sectionSubtitle}>
                {FOCUS_COPY["targets.subtitle"]}
              </Text>

              {targets.length === 0 ? (
                <View style={styles.inlineRowTop}>
                  <MaterialSymbol
                    name="info"
                    color={cosmicColors.focus}
                    size={theme.navbar.iconSize}
                  />
                  <Text allowFontScaling style={styles.emptyTargetsText}>
                    {FOCUS_COPY["targets.empty"]}
                  </Text>
                </View>
              ) : (
                <View accessibilityRole="radiogroup" style={styles.targetList}>
                  {targets.map((target) => (
                    <TargetOption
                      key={`${target.kind}:${target.id}`}
                      target={target}
                      selected={
                        selectedTarget?.kind === target.kind &&
                        selectedTarget?.id === target.id
                      }
                      onSelect={() => selectTarget(target)}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.card}>
              <GradientSurface
                from={cosmicGradients.card[0]}
                to={cosmicGradients.card[1]}
              />
              <Text
                accessibilityRole="header"
                allowFontScaling
                style={styles.sectionTitle}
              >
                {FOCUS_COPY["duration.title"]}
              </Text>
              <Text allowFontScaling style={styles.sectionSubtitle}>
                {formatFocusCopy("duration.subtitle", {
                  shortBreak: SHORT_BREAK_MINUTES,
                  longBreak: LONG_BREAK_MINUTES,
                  cycles: CYCLES_BEFORE_LONG_BREAK,
                })}
              </Text>

              <View
                accessibilityRole="radiogroup"
                style={styles.durationGrid}
              >
                {FOCUS_DURATIONS.map((minutes) => (
                  <DurationOption
                    key={minutes}
                    minutes={minutes}
                    selected={selectedDuration === minutes}
                    onSelect={() => selectDuration(minutes)}
                  />
                ))}
              </View>
            </View>

            {validationError || errorKey === "error.action" ? (
              <View accessibilityRole="alert" style={styles.inlineErrorBox}>
                <MaterialSymbol
                  name="error"
                  color={theme.color.error}
                  size={theme.navbar.iconSize}
                />
                <Text allowFontScaling style={styles.errorText}>
                  {validationError ?? FOCUS_COPY["error.action"]}
                </Text>
              </View>
            ) : null}

            <PrimaryButton
              theme={theme}
              label={FOCUS_COPY["start.cta"]}
              icon={
                <MaterialSymbol
                  name="play_arrow"
                  filled
                  color={
                    startDisabled
                      ? theme.button.labelDisabled
                      : theme.button.label
                  }
                  size={theme.navbar.iconSize}
                />
              }
              disabled={startDisabled}
              accessibilityHint={
                targets.length === 0 ? FOCUS_COPY["targets.empty"] : undefined
              }
              onPress={() => void start()}
            />
          </>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirmEndVisible}
        title={FOCUS_COPY["confirmEnd.title"]}
        message={FOCUS_COPY["confirmEnd.message"]}
        icon="timer"
        cancelLabel={FOCUS_COPY["confirmEnd.cancel"]}
        confirmLabel={FOCUS_COPY["confirmEnd.confirm"]}
        onCancel={cancelEnd}
        onConfirm={() => void confirmEnd()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.color.surface,
  },
  srOnly: {
    position: "absolute",
    width: theme.border.widthThin,
    height: theme.border.widthThin,
    opacity: 0,
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.space.md,
    paddingBottom: theme.space.lg,
    gap: theme.space.md,
  },
  planetContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.space.sm,
  },
  card: {
    backgroundColor: cosmicColors.card,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.card,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    gap: theme.space.sm,
    overflow: "hidden",
  },
  noticeCard: {
    backgroundColor: cosmicColors.card,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    gap: theme.space.sm,
  },
  noticeText: {
    ...theme.font["body-sm"],
    color: theme.color["on-surface"],
    flex: 1,
  },
  lastSessionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    backgroundColor: cosmicColors.card,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.card,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.md,
  },
  lastSessionText: {
    ...theme.font["body-sm"],
    color: theme.color["on-surface"],
    flex: 1,
  },
  sectionTitle: {
    ...theme.font["card-title"],
    color: theme.color["on-surface"],
  },
  sectionSubtitle: {
    ...theme.font["body-sm"],
    color: theme.color["on-surface-variant"],
  },
  emptyTargetsText: {
    ...theme.font.body,
    color: theme.color["on-surface"],
    flex: 1,
  },
  targetList: {
    gap: theme.space.sm,
  },
  targetOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    minHeight: theme.target.minSize,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: cosmicColors.sheet,
  },
  targetOptionSelected: {
    borderWidth: theme.focus.ringWidth,
    borderColor: theme.color.action,
    backgroundColor: cosmicColors.track,
  },
  targetTexts: {
    flex: 1,
    gap: theme.primitive["space-4"],
  },
  targetTitle: {
    ...theme.font["card-title"],
    color: theme.color["on-surface"],
  },
  targetKind: {
    ...theme.font.caption,
    color: theme.color["on-surface-variant"],
  },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space.sm,
  },
  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.primitive["space-4"],
    minHeight: theme.target.minSize,
    minWidth: theme.target.minSize * 2,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: cosmicColors.sheet,
  },
  durationChipSelected: {
    borderWidth: theme.focus.ringWidth,
    borderColor: theme.color.action,
    backgroundColor: cosmicColors.track,
  },
  durationLabel: {
    ...theme.font.label,
    color: theme.color["on-surface"],
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.sm,
  },
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.primitive["space-4"],
    paddingVertical: theme.primitive["space-4"],
    paddingHorizontal: theme.space.sm,
    borderRadius: theme.radius.md,
    backgroundColor: cosmicColors.track,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicColors.action,
  },
  statusBadge: {
    paddingVertical: theme.primitive["space-4"],
    paddingHorizontal: theme.space.sm,
    borderRadius: theme.radius.md,
    backgroundColor: cosmicColors.sheet,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
  },
  badgeText: {
    ...theme.font.label,
    color: theme.color["on-surface"],
  },
  linkedTargetBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    backgroundColor: cosmicColors.sheet,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
  },
  linkedCaption: {
    ...theme.font.caption,
    color: theme.color["on-surface-variant"],
  },
  timerDisplay: {
    ...theme.font.streak,
    color: theme.color["on-surface"],
    textAlign: "center",
    paddingVertical: theme.space.sm,
  },
  progressTrack: {
    height: theme.progress.height,
    borderRadius: theme.progress.height / 2,
    backgroundColor: theme.progress.track,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.progress.height / 2,
    overflow: "hidden",
  },
  focusedSummary: {
    ...theme.font["body-sm"],
    color: theme.color["on-surface-variant"],
    textAlign: "center",
  },
  controlsGroup: {
    gap: theme.space.sm,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space.sm,
    minHeight: theme.target.minSize,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: cosmicColors.sheet,
  },
  secondaryButtonLabel: {
    ...theme.font.label,
    color: theme.color["on-surface"],
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  inlineRowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.space.sm,
  },
  inlineErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.widthThin,
    borderColor: theme.color.error,
    backgroundColor: cosmicColors.card,
  },
  errorText: {
    ...theme.font.body,
    color: theme.color["on-surface"],
    flex: 1,
  },
  pressed: {
    opacity: theme.motion.opacityPressed,
    transform: [{ scale: theme.motion.scalePressed }],
  },
});
