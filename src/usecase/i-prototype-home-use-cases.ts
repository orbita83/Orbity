import type { HomeDashboardData } from "../model/entities/home-dashboard";

// Temporário: protótipo, removido na Etapa 7 de docs/designs/tela-inicial-base.md.
export interface IPrototypeHomeUseCases {
  loadDashboard(): Promise<HomeDashboardData>;
  completeFocusSession(minutesCompleted: number): Promise<HomeDashboardData>;
}
