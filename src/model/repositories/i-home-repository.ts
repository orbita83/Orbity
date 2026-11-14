import type { HomeDashboardData } from "../entities/home-dashboard";

export interface IHomeRepository {
  getDashboardData(): Promise<HomeDashboardData>;
  recordFocusSession(minutesCompleted: number): Promise<HomeDashboardData>;
}
