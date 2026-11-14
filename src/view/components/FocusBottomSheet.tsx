import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { FocusDuration } from "../../model/entities/focus-duration";
import type { FocusAvailability } from "../../model/entities/home-summary";
import type { FocusSheetStage } from "../../viewmodel/ActivitySheetGeometry";
import { HOME_COPY, formatCopy } from "../home-copy";
import { cosmicBorders, cosmicColors, cosmicGradients, themes } from "../theme/tokens";
import { CosmicIcon } from "./CosmicIcon";
import { FilterChips } from "./filter-chips";
import { GradientSurface } from "./GradientSurface";
import { PrimaryButton } from "./primary-button";

const theme = themes.cosmic;

export type FocusBottomSheetProps = {
  stage: FocusSheetStage;
  loading?: boolean;
  /** "concluídas/total", sempre visível (RN-0007). */
  progressLabel: string;
  /** Proporção concluída; `null` quando não há atividades (barra vazia, sem porcentagem). */
  progressRatio: number | null;
  progressCompleted: number;
  progressTotal: number;
  focus: FocusAvailability;
  selectedDuration: FocusDuration;
  onSelectDuration: (duration: FocusDuration) => void;
  onToggleStage: () => void;
  onCollapseSheet: () => void;
  dragging: boolean;
  onScrollOffsetChange: (offset: number) => void;
  onHandleTouchStart: () => void;
};

const Card = ({ children }: { children: ReactNode }) => (
  <View style={styles.card}>
    <GradientSurface from={cosmicGradients.card[0]} to={cosmicGradients.card[1]} />
    {children}
  </View>
);

export const FocusBottomSheet = ({
  stage,
  loading = false,
  progressLabel,
  progressRatio,
  progressCompleted,
  progressTotal,
  focus,
  selectedDuration,
  onSelectDuration,
  onToggleStage,
  onCollapseSheet,
  dragging,
  onScrollOffsetChange,
  onHandleTouchStart,
}: FocusBottomSheetProps) => {
  const [handleFocused, setHandleFocused] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (stage !== "stage1_2") {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      onScrollOffsetChange(0);
    }
  }, [onScrollOffsetChange, stage]);

  const blocked = !focus.canStart;
  const durationOptions = focus.durations.map((duration) => ({
    id: String(duration),
    label: formatCopy("focus.duration", { n: duration }),
  }));

  return (
    <View style={styles.sheet}>
      <GradientSurface from={cosmicGradients.sheet[0]} to={cosmicGradients.sheet[1]} />
      <Pressable
        onTouchStart={onHandleTouchStart}
        onPressIn={onHandleTouchStart}
        accessibilityRole="button"
        accessibilityLabel={stage === "stage1_2" ? HOME_COPY["sheet.close"] : HOME_COPY["sheet.open"]}
        accessibilityState={{ expanded: stage !== "collapsed" }}
        onPress={onToggleStage}
        onAccessibilityEscape={onCollapseSheet}
        onFocus={() => setHandleFocused(true)}
        onBlur={() => setHandleFocused(false)}
        style={[styles.handleTarget, handleFocused && styles.focused]}
      >
        <View style={styles.handle} />
      </Pressable>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!dragging}
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScroll={(event) => onScrollOffsetChange(event.nativeEvent.contentOffset.y)}
      >
        {loading ? (
          <View accessibilityLabel={HOME_COPY.loading} style={styles.skeletonGroup}>
            {[0, 1, 2].map((key) => (
              <View key={key} style={styles.skeletonCard}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonBody} />
              </View>
            ))}
          </View>
        ) : (
          <>
            <Card>
              <View style={styles.heading}>
                <CosmicIcon name="timer" size={theme.size.iconLg} />
                <View style={styles.headingText}>
                  <Text allowFontScaling accessibilityRole="header" style={styles.title}>
                    {HOME_COPY["focus.title"]}
                  </Text>
                  <Text allowFontScaling style={styles.description}>
                    {HOME_COPY["focus.description"]}
                  </Text>
                </View>
              </View>
              <FilterChips
                theme={theme}
                accessibilityLabel={HOME_COPY["focus.durations"]}
                itemAccessibilityLabel={(label) => label}
                filters={durationOptions}
                selectedFilter={String(selectedDuration)}
                onSelectFilter={(id) => onSelectDuration(Number(id) as FocusDuration)}
              />
              <PrimaryButton
                theme={theme}
                label={HOME_COPY["focus.start"]}
                // O motor da sessão de foco chega com a mudança de Tarefas (E1).
                onPress={() => undefined}
                disabled={blocked}
                accessibilityHint={blocked ? HOME_COPY["focus.blocked"] : undefined}
              />
              {blocked ? (
                <Text allowFontScaling style={styles.description}>
                  {HOME_COPY["focus.blocked"]}
                </Text>
              ) : null}
            </Card>

            <Card>
              <View style={styles.progressHeading}>
                <View style={styles.headingText}>
                  <Text allowFontScaling accessibilityRole="header" style={styles.title}>
                    {HOME_COPY["progress.title"]}
                  </Text>
                  <Text allowFontScaling style={styles.description}>
                    {progressCompleted === 0 ? HOME_COPY["progress.empty"] : HOME_COPY["progress.ongoing"]}
                  </Text>
                </View>
                <View style={styles.progressBadge}>
                  <Text allowFontScaling style={styles.badgeLabel}>
                    {progressLabel}
                  </Text>
                </View>
              </View>
              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={HOME_COPY["progress.title"]}
                accessibilityValue={{
                  min: 0,
                  max: progressTotal,
                  now: progressCompleted,
                  text: formatCopy("progress.value", { completed: progressCompleted, total: progressTotal }),
                }}
                style={styles.progressTrack}
              >
                {progressRatio !== null && progressRatio > 0 ? (
                  <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]}>
                    <GradientSurface from={cosmicGradients.progress[0]} to={cosmicGradients.progress[1]} horizontal />
                  </View>
                ) : null}
              </View>
            </Card>

            <View
              accessible
              accessibilityRole="button"
              accessibilityLabel={HOME_COPY["achievements.label"]}
              accessibilityState={{ disabled: true }}
              style={[styles.card, styles.achievements]}
            >
              <CosmicIcon name="star" size={theme.size.iconLg} color={cosmicColors.achievementPendingIcon} />
              <Text allowFontScaling style={styles.description}>
                {HOME_COPY["achievements.soon"]}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    borderTopLeftRadius: theme.sheet.radius,
    borderTopRightRadius: theme.sheet.radius,
    borderTopWidth: theme.border.widthThin,
    borderLeftWidth: theme.border.widthThin,
    borderRightWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    backgroundColor: cosmicColors.sheet,
    boxShadow: theme.sheet.shadow,
    overflow: "hidden",
  },
  handleTarget: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.target.minSize,
    borderWidth: theme.focus.ringWidth,
    borderColor: "transparent",
    marginHorizontal: theme.space.lg,
    borderRadius: theme.radius.md,
  },
  handle: {
    width: theme.sheet.handleWidth,
    height: theme.sheet.handleHeight,
    borderRadius: theme.sheet.handleHeight / 2,
    backgroundColor: theme.sheet.handle,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: theme.space.md, paddingBottom: theme.space.md, gap: theme.space.sm },
  card: {
    backgroundColor: cosmicColors.card,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.card,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    gap: theme.space.sm,
    overflow: "hidden",
  },
  heading: { flexDirection: "row", gap: theme.space.md, alignItems: "center" },
  headingText: { flex: 1, gap: theme.primitive["space-4"] },
  title: { ...theme.font.label, color: theme.color["on-surface"] },
  description: { ...theme.font.caption, color: theme.color["on-surface-variant"] },
  focused: { borderColor: theme.color.focus },
  progressHeading: { flexDirection: "row", alignItems: "center", gap: theme.space.sm, flexWrap: "wrap" },
  progressBadge: {
    borderWidth: theme.border.widthThin,
    borderColor: cosmicBorders.sheet,
    borderRadius: theme.radius.md,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.md,
  },
  badgeLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  progressTrack: {
    height: theme.progress.height,
    borderRadius: theme.progress.height / 2,
    backgroundColor: theme.progress.track,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: theme.progress.height / 2, overflow: "hidden" },
  achievements: { flexDirection: "row", alignItems: "center", gap: theme.space.md, minHeight: theme.target.minSize },
  skeletonGroup: { gap: theme.space.md },
  skeletonCard: {
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    gap: theme.space.md,
    backgroundColor: cosmicColors.card,
  },
  skeletonTitle: { height: theme.space.md, width: "45%", borderRadius: theme.space.sm, backgroundColor: cosmicColors.track },
  skeletonBody: { height: theme.space.sm, width: "80%", borderRadius: theme.primitive["space-4"], backgroundColor: cosmicColors.track },
});
