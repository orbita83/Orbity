export type AchievementIconKey =
  | "local_fire_department"
  | "track_changes"
  | "rocket_launch"
  | "emoji_events";

export interface AchievementMilestone {
  id: string;
  label: string;
  targetDays: number;
  unlocked: boolean;
  iconKey: AchievementIconKey;
  description: string;
}

export interface DailyFocusProgress {
  completedMinutes: number;
  targetMinutes: number;
  completedSessions: number;
  targetSessions: number;
}

export interface HomeDashboardData {
  streakDays: number;
  planetStageName: string;
  dailyProgress: DailyFocusProgress;
  achievements: readonly AchievementMilestone[];
  lastSession?: { minutes: number; completedAtLabel: string };
}
