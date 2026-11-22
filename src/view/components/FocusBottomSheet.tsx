import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { FocusAvailability } from "../../model/entities/homeSummary";
import type { FocusSheetStage } from "../../viewmodel/useHomeViewModel";
import { HOME_COPY, formatCopy } from "../homeCopy";
import { cosmicBorders, cosmicColors, cosmicGradients, themes } from "../theme/tokens";
import { GradientSurface } from "./GradientSurface";
import { MaterialSymbol, type MaterialSymbolName } from "./MaterialSymbol";
import { PrimaryButton } from "./PrimaryButton";

const theme = themes.cosmic;

/** Medalhas do card de Conquistas, na ordem do protótipo. Sem dados ainda: todas bloqueadas. */
const ACHIEVEMENT_ICONS: readonly MaterialSymbolName[] = ["whatshot", "track_changes", "bolt", "emoji_events"];

export type FocusBottomSheetProps = {
  stage: FocusSheetStage;
  loading?: boolean;
  /** "concluídas/total", sempre visível (RN-0007). */
  progressLabel: string;
  /** Proporção concluída; `null` quando não há atividades (barra vazia, sem porcentagem). */
  progressRatio: number | null;
  progressCompleted: number;
  progressTotal: number;
  /** Indica se o estudante conquistou a estrela de sequência hoje (RF-0017 CA-05). */
  starEarnedToday?: boolean;
  focus: FocusAvailability;
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

/** Seta do card. As telas de destino ainda não existem: o botão aparece, mas fica desabilitado. */
const ChevronButton = ({ label }: { label: string }) => (
  <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: true }} disabled style={styles.chevron}>
    <MaterialSymbol name="chevron_right" color={cosmicColors.inactive} size={theme.navbar.iconSize} />
  </Pressable>
);

type CardHeadingProps = {
  icon?: MaterialSymbolName;
  title: string;
  description: string;
  action?: string;
  alignTop?: boolean;
  trailing?: ReactNode;
};

const CardHeading = ({ icon, title, description, action, alignTop = false, trailing }: CardHeadingProps) => (
  <View style={[styles.heading, alignTop && styles.headingTop]}>
    {icon ? <MaterialSymbol name={icon} color={cosmicColors.focus} size={theme.size.iconLg} /> : null}
    <View style={styles.headingText}>
      <Text allowFontScaling accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text allowFontScaling style={styles.description}>
        {description}
      </Text>
    </View>
    {trailing}
    {action ? <ChevronButton label={action} /> : null}
  </View>
);

export const FocusBottomSheet = ({
  stage,
  loading = false,
  progressLabel,
  progressRatio,
  progressCompleted,
  progressTotal,
  starEarnedToday = false,
  focus,
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
  const percent = progressRatio === null ? null : Math.round(progressRatio * 100);

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
              <CardHeading
                icon="timer"
                title={HOME_COPY["focus.title"]}
                description={HOME_COPY["focus.description"]}
                action={HOME_COPY["focus.details"]}
              />
              <PrimaryButton
                theme={theme}
                label={HOME_COPY["focus.start"]}
                icon={<MaterialSymbol name="play_arrow" filled color={blocked ? theme.button.labelDisabled : theme.button.label} size={theme.navbar.iconSize} />}
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
              <CardHeading
                alignTop
                title={HOME_COPY["progress.title"]}
                description={HOME_COPY["progress.description"]}
                trailing={
                  <View style={styles.progressCounter}>
                    <View style={styles.progressBadge}>
                      <Text allowFontScaling style={styles.badgeLabel}>
                        {progressLabel}
                      </Text>
                    </View>
                    {/* ODS 1.2: a porcentagem fica fora da barra; RN-0007: sem atividades não há porcentagem. */}
                    {percent !== null ? (
                      <Text allowFontScaling style={styles.badgeLabel}>
                        {formatCopy("progress.percent", { percent })}
                      </Text>
                    ) : null}
                  </View>
                }
              />
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
              {starEarnedToday ? (
                <Text allowFontScaling style={styles.description}>
                  {HOME_COPY["progress.starEarnedToday"]}
                </Text>
              ) : null}
            </Card>

            <Card>
              <CardHeading
                icon="star"
                title={HOME_COPY["achievements.title"]}
                description={HOME_COPY["achievements.description"]}
                action={HOME_COPY["achievements.open"]}
              />
              <View style={styles.badges}>
                {ACHIEVEMENT_ICONS.map((icon, index) => (
                  <View
                    key={icon}
                    accessible
                    accessibilityLabel={formatCopy("achievements.badge", { n: index + 1, total: ACHIEVEMENT_ICONS.length })}
                    style={styles.badgeSlot}
                  >
                    <View style={styles.badge}>
                      <MaterialSymbol name={icon} color={cosmicColors.achievementPendingIcon} size={theme.navbar.iconSize} />
                      <View style={styles.lockBubble}>
                        <MaterialSymbol name="lock" filled color={cosmicColors.achievementPendingIcon} size={theme.space.md} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </Card>

            <Card>
              <CardHeading
                icon="history"
                title={HOME_COPY["lastSession.title"]}
                description={HOME_COPY["lastSession.empty"]}
                action={HOME_COPY["lastSession.details"]}
              />
            </Card>

            <Card>
              <CardHeading
                icon="help_outline"
                title={HOME_COPY["howItWorks.title"]}
                description={HOME_COPY["howItWorks.description"]}
                action={HOME_COPY["howItWorks.open"]}
              />
            </Card>
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
    borderColor: theme.color["border-subtle"],
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
  heading: { flexDirection: "row", gap: theme.space.sm, alignItems: "center" },
  headingTop: { alignItems: "flex-start" },
  headingText: { flex: 1 },
  title: { ...theme.font["card-title"], color: theme.color["on-surface"] },
  description: { ...theme.font["body-sm"], color: theme.color["on-surface-variant"] },
  chevron: {
    width: theme.target.minSize,
    height: theme.target.minSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
  },
  focused: { borderColor: theme.color.focus },
  progressBadge: {
    borderWidth: theme.border.widthThin,
    borderColor: cosmicColors.action,
    backgroundColor: cosmicColors.track,
    borderRadius: theme.radius.md,
    paddingVertical: theme.primitive["space-4"],
    paddingHorizontal: theme.space.sm,
  },
  badgeLabel: { ...theme.font.label, color: theme.color["on-surface"] },
  progressTrack: {
    height: theme.progress.height,
    borderRadius: theme.progress.height / 2,
    backgroundColor: theme.progress.track,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: theme.progress.height / 2, overflow: "hidden" },
  progressCounter: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  badges: { flexDirection: "row", gap: theme.space.sm },
  badgeSlot: { flex: 1, alignItems: "center", paddingVertical: theme.primitive["space-4"] },
  badge: {
    width: theme.achievement.size,
    height: theme.achievement.size,
    borderRadius: theme.achievement.radius,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicColors.achievementPendingBorder,
    backgroundColor: cosmicGradients.card[1],
    alignItems: "center",
    justifyContent: "center",
  },
  lockBubble: {
    position: "absolute",
    bottom: -theme.primitive["space-4"],
    width: theme.space.lg,
    height: theme.space.lg,
    borderRadius: theme.space.lg / 2,
    borderWidth: theme.border.widthThin,
    borderColor: cosmicColors.achievementPendingBorder,
    backgroundColor: cosmicColors.card,
    alignItems: "center",
    justifyContent: "center",
  },
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
