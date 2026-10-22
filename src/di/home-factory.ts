import {
  InMemoryHomeRepository,
  PROTOTYPE_HOME_DASHBOARD,
} from "../infra/repositories/in-memory-home-repository";
import type { HomeDashboardData } from "../model/entities/home-dashboard";
import { HomeUseCases } from "../usecase/home-use-cases";
import type { IHomeUseCases } from "../usecase/i-home-use-cases";

export const makeHomeUseCases = (
  initialData: HomeDashboardData = PROTOTYPE_HOME_DASHBOARD,
): IHomeUseCases => {
  const repository = new InMemoryHomeRepository(initialData);
  return new HomeUseCases(repository);
};
