import type { HomeDashboardData } from "../model/entities/home-dashboard";
import type { IHomeRepository } from "../model/repositories/i-home-repository";
import type { IHomeUseCases } from "./i-home-use-cases";

export class HomeUseCases implements IHomeUseCases {
  constructor(private readonly homeRepository: IHomeRepository) {}

  async loadDashboard(): Promise<HomeDashboardData> {
    return this.homeRepository.getDashboardData();
  }

  async completeFocusSession(
    minutesCompleted: number,
  ): Promise<HomeDashboardData> {
    const validMinutes = Math.max(0, minutesCompleted);
    return this.homeRepository.recordFocusSession(validMinutes);
  }
}
