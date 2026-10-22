import type { HomeDashboardData } from "../model/entities/home-dashboard";

export interface IHomeUseCases {
  loadDashboard(): Promise<HomeDashboardData>;
  completeFocusSession(minutesCompleted: number): Promise<HomeDashboardData>;
}
