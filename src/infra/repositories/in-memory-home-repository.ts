import type { HomeDashboardData } from "../../model/entities/home-dashboard";
import type { IHomeRepository } from "../../model/repositories/i-home-repository";

export const PROTOTYPE_HOME_DASHBOARD: HomeDashboardData = {
  streakDays: 12,
  planetStageName: "Planeta com anéis orbitais e satélites ativos",
  lastSession: { minutes: 25, completedAtLabel: "Hoje, 10:42" },
  dailyProgress: {
    completedMinutes: 15,
    targetMinutes: 25,
    completedSessions: 1,
    targetSessions: 15,
  },
  achievements: [
    {
      id: "streak-3",
      label: "3 dias",
      targetDays: 3,
      unlocked: true,
      iconKey: "local_fire_department",
      description: "Conquistada ao manter 3 dias de constância nos estudos.",
    },
    {
      id: "streak-7",
      label: "7 dias",
      targetDays: 7,
      unlocked: false,
      iconKey: "track_changes",
      description: "Desafio de 7 dias de foco contínuo no seu universo.",
    },
    {
      id: "streak-14",
      label: "14 dias",
      targetDays: 14,
      unlocked: false,
      iconKey: "rocket_launch",
      description: "Desafio de 14 dias para expandir sua órbita de estudos.",
    },
    {
      id: "streak-30",
      label: "30 dias",
      targetDays: 30,
      unlocked: false,
      iconKey: "emoji_events",
      description: "Marco de 30 dias celebrando sua trajetória acumulada.",
    },
  ],
};

export class InMemoryHomeRepository implements IHomeRepository {
  private currentData: HomeDashboardData;

  constructor(initialData: HomeDashboardData = PROTOTYPE_HOME_DASHBOARD) {
    this.currentData = initialData;
  }

  async getDashboardData(): Promise<HomeDashboardData> {
    return this.currentData;
  }

  async recordFocusSession(
    minutesCompleted: number,
  ): Promise<HomeDashboardData> {
    const updatedMinutes = Math.min(
      this.currentData.dailyProgress.targetMinutes,
      this.currentData.dailyProgress.completedMinutes + minutesCompleted,
    );
    const updatedSessions = Math.min(
      this.currentData.dailyProgress.targetSessions,
      this.currentData.dailyProgress.completedSessions + 1,
    );

    this.currentData = {
      ...this.currentData,
      lastSession: { minutes: minutesCompleted, completedAtLabel: `Hoje, ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` },
      dailyProgress: {
        ...this.currentData.dailyProgress,
        completedMinutes: updatedMinutes,
        completedSessions: updatedSessions,
      },
    };

    return this.currentData;
  }
}
