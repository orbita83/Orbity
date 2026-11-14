import type { HomeDashboardData } from "../model/entities/home-dashboard";
import type { IHomeRepository } from "../model/repositories/i-home-repository";
import type { IPrototypeHomeUseCases } from "./i-prototype-home-use-cases";

// Temporário: protótipo, removido na Etapa 7 de docs/designs/tela-inicial-base.md.
export class PrototypeHomeUseCases implements IPrototypeHomeUseCases {
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
