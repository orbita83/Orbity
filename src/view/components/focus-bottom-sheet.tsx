import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { AchievementMilestone, DailyFocusProgress } from "../../model/entities/home-dashboard";
import type { FocusSheetStage } from "../../viewmodel/use-home-view-model";
import { cosmicTokens as t } from "../theme/tokens";
import { CosmicIcon, type CosmicIconName } from "./cosmic-icon";
import { GradientSurface } from "./gradient-surface";
import { PrimaryButton } from "./primary-button";

export type FocusBottomSheetProps = {
  stage: FocusSheetStage;
  dailyProgress: DailyFocusProgress;
  achievements: readonly AchievementMilestone[];
  isFocusMode: boolean;
  loading?: boolean;
  onToggleStage: () => void;
  onCollapseSheet: () => void;
  onExpandSheet: () => void;
  onToggleFocus: () => void;
  onOpenAchievements: () => void;
  onSelectAchievement: (milestone: AchievementMilestone) => void;
  onOpenLastSession: () => void;
  onOpenHelp: () => void;
  lastSessionLabel: string;
  focusTimerLabel?: string;
  dragging: boolean;
  onScrollOffsetChange: (offset: number) => void;
  onHandleTouchStart: () => void;
};

type CardHeadingProps = { title: string; description: string; icon: CosmicIconName; onPress: () => void };

const CardHeading = ({ title, description, icon, onPress }: CardHeadingProps) => {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${description}`} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [styles.cardHeading, pressed && styles.pressed, focused && styles.focused]}>
      <CosmicIcon name={icon} size={t.layout.featureIconSize} />
      <View style={styles.headingText}>
        <Text allowFontScaling style={styles.title}>{title}</Text>
        <Text allowFontScaling style={styles.description}>{description}</Text>
      </View>
      <CosmicIcon name="chevron" color={t.color.inactive} size={18} />
    </Pressable>
  );
};

const AchievementBadge = ({ milestone, onPress }: { milestone: AchievementMilestone; onPress: () => void }) => {
  const [focused, setFocused] = useState(false);
  const iconNames: Record<AchievementMilestone["iconKey"], CosmicIconName> = { local_fire_department: "flame", track_changes: "target", rocket_launch: "rocket", emoji_events: "trophy" };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${milestone.label}. ${milestone.unlocked ? "Conquistada" : "A conquistar"}. ${milestone.description}`} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [styles.achievement, pressed && styles.pressed, focused && styles.focused]}>
      <View style={[styles.achievementCircle, milestone.unlocked && styles.unlockedCircle]}>
        <CosmicIcon name={iconNames[milestone.iconKey]} size={t.layout.achievementIconSize} color={milestone.unlocked ? t.color.unlocked : t.color.lockedIcon} />
        {!milestone.unlocked ? <View style={styles.lockBadge}><CosmicIcon name="lock" color={t.color.lockedIcon} size={10} /></View> : null}
      </View>
      <Text allowFontScaling style={[styles.achievementLabel, milestone.unlocked && styles.unlockedLabel]}>{milestone.label}</Text>
    </Pressable>
  );
};

export const FocusBottomSheet = ({ stage, dailyProgress, achievements, isFocusMode, loading = false, onToggleStage, onCollapseSheet, onExpandSheet, onToggleFocus, onOpenAchievements, onSelectAchievement, onOpenLastSession, onOpenHelp, lastSessionLabel, focusTimerLabel, dragging, onScrollOffsetChange, onHandleTouchStart }: FocusBottomSheetProps) => {
  const [handleFocused, setHandleFocused] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (stage !== "stage1_2") {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      onScrollOffsetChange(0);
    }
  }, [onScrollOffsetChange, stage]);
  const progress = dailyProgress.targetMinutes > 0 ? Math.min(1, Math.max(0, dailyProgress.completedMinutes / dailyProgress.targetMinutes)) : 0;

  return (
    <View style={styles.sheet}>
      <GradientSurface from={t.color.sheet} to={t.color.sheetEnd} />
      <Pressable onTouchStart={onHandleTouchStart} onPressIn={onHandleTouchStart} accessibilityRole="button" accessibilityLabel={stage === "stage1_2" ? "Recolher painel de foco" : "Expandir painel de foco"} accessibilityHint="Arraste para cima ou para baixo, ou toque para alternar a altura. Escape recolhe o painel." accessibilityState={{ expanded: stage !== "collapsed" }} onPress={onToggleStage} onAccessibilityEscape={onCollapseSheet} onFocus={() => setHandleFocused(true)} onBlur={() => setHandleFocused(false)} style={[styles.handleTarget, handleFocused && styles.focused]}>
        <View style={styles.handle} />
      </Pressable>
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" accessibilityState={{ busy: loading }} scrollEnabled={!dragging} bounces={false} overScrollMode="never" scrollEventThrottle={16} onScroll={(event) => onScrollOffsetChange(event.nativeEvent.contentOffset.y)}>
        {loading ? <View accessibilityLabel="Carregando seu progresso" style={styles.skeletonGroup}>{[0, 1, 2].map((key) => <View key={key} style={styles.skeletonCard}><View style={styles.skeletonTitle} /><View style={styles.skeletonBody} /></View>)}</View> : <>
          <View style={styles.card}>
            <GradientSurface from={t.color.card} to={t.color.cardEnd} />
            <CardHeading icon="timer" title={isFocusMode ? `Em foco · ${focusTimerLabel ?? "25:00"}` : "Modo Foco"} description={isFocusMode ? "Um momento só para você e seus estudos." : "Concentre-se no que importa."} onPress={onExpandSheet} />
            <PrimaryButton appearance="cosmic" iconName={isFocusMode ? undefined : "play_arrow"} label={isFocusMode ? "Encerrar foco" : "Iniciar foco"} onPress={onToggleFocus} accessibilityHint={isFocusMode ? "Encerra a sessão e registra o tempo estudado" : "Inicia uma sessão de foco"} disabled={loading} />
          </View>

          <View style={[styles.card, styles.progressCard]}>
            <GradientSurface from={t.color.card} to={t.color.cardEnd} />
            <View style={styles.progressHeading}>
              <View style={styles.headingText}>
                <Text allowFontScaling accessibilityRole="header" style={styles.title}>Progresso de hoje</Text>
                <Text allowFontScaling style={styles.description}>{dailyProgress.completedMinutes === 0 ? "Seu próximo passo começa aqui." : "Conquiste sua estrela estudando."}</Text>
              </View>
              <View style={styles.progressBadge}><Text allowFontScaling style={styles.badgeLabel}>{dailyProgress.completedMinutes} / {dailyProgress.targetMinutes} min</Text></View>
            </View>
            <View accessible accessibilityRole="progressbar" accessibilityLabel="Progresso de estudo de hoje" accessibilityValue={{ min: 0, max: dailyProgress.targetMinutes, now: dailyProgress.completedMinutes, text: `${dailyProgress.completedMinutes} de ${dailyProgress.targetMinutes} minutos` }} style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]}><GradientSurface from={t.color.progress} to={t.color.progressEnd} horizontal /></View>
            </View>
          </View>

          <View style={styles.card}>
            <GradientSurface from={t.color.card} to={t.color.cardEnd} />
            <CardHeading icon="star" title="Conquistas" description="Desafios para evoluir no seu universo." onPress={onOpenAchievements} />
            <View style={styles.achievements}>
              {achievements.map((milestone) => <AchievementBadge key={milestone.id} milestone={milestone} onPress={() => onSelectAchievement(milestone)} />)}
            </View>
          </View>

          {stage === "stage1_2" ? <>
            <View style={styles.card}><GradientSurface from={t.color.card} to={t.color.cardEnd} /><CardHeading icon="chart" title="Última sessão" description={lastSessionLabel} onPress={onOpenLastSession} /></View>
            <View style={styles.card}><GradientSurface from={t.color.card} to={t.color.cardEnd} /><CardHeading icon="help" title="Como funciona?" description="Complete sua meta diária de foco para manter sua sequência." onPress={onOpenHelp} /></View>
          </> : null}
        </>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: { flex: 1, borderTopLeftRadius: t.radius.sheet, borderTopRightRadius: t.radius.sheet, borderTopWidth: t.border.sheet, borderColor: t.color.sheetBorder, borderLeftWidth: t.border.subtle, borderRightWidth: t.border.subtle, backgroundColor: t.color.sheet, overflow: "hidden" },
  handleTarget: { alignItems: "center", justifyContent: "center", minHeight: t.layout.handleTargetHeight, borderWidth: t.border.focus, borderColor: t.color.transparent, marginHorizontal: t.space.xl, borderRadius: t.radius.button, touchAction: "none" },
  handle: { width: t.layout.handleWidth, height: t.layout.handleHeight, borderRadius: t.radius.pill, backgroundColor: t.color.handle },
  scroll: { flex: 1 },
  content: { paddingHorizontal: t.space.md, paddingBottom: t.space.sm, gap: 10 },
  card: { backgroundColor: t.color.card, borderWidth: t.border.subtle, borderColor: t.color.cardBorder, borderRadius: t.radius.card, padding: t.space.md, gap: 6, overflow: "hidden" },
  cardHeading: { minHeight: 44, flexDirection: "row", gap: t.space.lg, alignItems: "center", borderWidth: t.border.focus, borderColor: t.color.transparent, borderRadius: t.radius.button },
  headingText: { flex: 1, gap: 2 },
  title: { ...t.font.title, color: t.color.text },
  description: { ...t.font.body, color: t.color.muted },
  pressed: { opacity: t.motion.pressedOpacity },
  focused: { borderColor: t.color.focus },
  progressCard: { padding: 14, gap: 10 },
  progressHeading: { flexDirection: "row", alignItems: "center", gap: t.space.sm, flexWrap: "wrap" },
  progressBadge: { borderWidth: t.border.subtle, borderColor: t.color.badgeBorder, borderRadius: t.radius.button, paddingVertical: t.space.sm, paddingHorizontal: t.space.md },
  badgeLabel: { ...t.font.body, color: t.color.text, fontWeight: "500" },
  progressTrack: { height: t.layout.progressHeight, borderRadius: t.radius.pill, backgroundColor: t.color.track, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: t.radius.pill, overflow: "hidden" },
  achievements: { flexDirection: "row", justifyContent: "space-between", gap: t.space.xs },
  achievement: { flex: 1, alignItems: "center", gap: t.space.xs, borderRadius: t.radius.button, borderColor: t.color.transparent, borderWidth: t.border.focus },
  achievementCircle: { width: t.layout.achievementSize, height: t.layout.achievementSize, borderRadius: t.radius.pill, borderWidth: t.border.sheet, borderColor: t.color.lockedBorder, alignItems: "center", justifyContent: "center", backgroundColor: t.color.sheetEnd },
  unlockedCircle: { borderColor: t.color.unlocked, boxShadow: "0 0 14px rgba(178, 85, 255, 0.35)" },
  lockBadge: { position: "absolute", bottom: -3, backgroundColor: t.color.cardEnd, paddingHorizontal: t.space.xs },
  achievementLabel: { ...t.font.caption, color: t.color.muted, textAlign: "center" },
  unlockedLabel: { color: t.color.text, fontWeight: "500" },
  skeletonGroup: { gap: t.space.md },
  skeletonCard: { borderRadius: t.radius.card, minHeight: 100, padding: t.space.lg, gap: t.space.md, backgroundColor: t.color.card },
  skeletonTitle: { height: 20, width: "45%", borderRadius: t.radius.pill, backgroundColor: t.color.track },
  skeletonBody: { height: 14, width: "80%", borderRadius: t.radius.pill, backgroundColor: t.color.track },
});
