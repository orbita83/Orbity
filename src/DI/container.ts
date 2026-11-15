/**
 * Composition Root e Container de Injeção de Dependências (`src/DI/container.ts`).
 *
 * Conecta implementações concretas de `src/infra/` aos casos de uso em `src/usecase/`
 * por meio dos contratos de domínio de `src/model/`, e fornece contratos de Use Cases
 * para as ViewModels em `src/viewmodel/`.
 *
 * Direção de dependências assegurada por este módulo:
 * View -> ViewModel -> Use Cases -> Domínio (Model) <- Infraestrutura
 */

import { SystemClockService } from "@/infra/services/system-clock-service";
import type { IActivityCatalog } from "@/model/repositories/i-activity-catalog";
import type { IDailyActivityRepository } from "@/model/repositories/i-daily-activity-repository";
import type { ITaskRepository } from "@/model/repositories/i-task-repository";
import type { IClockService } from "@/model/services/i-clock-service";
import { HomeUseCases } from "@/usecase/home-use-cases";
import type { IHomeUseCases } from "@/usecase/i-home-use-cases";
import type { IStreakUseCases } from "@/usecase/i-streak-use-cases";
import type { ITaskUseCases } from "@/usecase/i-task-use-cases";
import { StreakUseCases } from "@/usecase/streak-use-cases";
import { TaskUseCases } from "@/usecase/task-use-cases";
// Resolvido pelo Metro: persistence.ts no Android e persistence.web.ts na web (D8).
import { createPersistence } from "./persistence";

/**
 * Registro de contratos de repositórios de domínio (`src/model/repositories/`).
 * Expandido conforme os épicos funcionais introduzem repositórios concretos em `src/infra/repositories/`.
 */
export type RepositoryRegistry = Record<string, unknown>;

/**
 * Registro de contratos de serviços de domínio (`src/model/services/`).
 * Expandido conforme os épicos funcionais introduzem serviços concretos em `src/infra/services/`.
 */
export type ServiceRegistry = Record<string, unknown>;

/**
 * Registro de contratos de casos de uso (`src/usecase/`).
 * Expandido conforme os épicos funcionais introduzem Use Cases orquestrados sobre contratos de domínio.
 */
export type UseCaseRegistry = Record<string, unknown>;

/**
 * Contrato que agrupa as abstrações de infraestrutura injetadas nos Use Cases.
 */
export interface InfrastructureDependencies<
  TRepositories extends object = RepositoryRegistry,
  TServices extends object = ServiceRegistry,
> {
  readonly repositories: Readonly<TRepositories>;
  readonly services: Readonly<TServices>;
}

/**
 * Container imutável de Injeção de Dependências que expõe as camadas compostas.
 */
export interface DependencyContainer<
  TRepositories extends object = RepositoryRegistry,
  TServices extends object = ServiceRegistry,
  TUseCases extends object = UseCaseRegistry,
> extends InfrastructureDependencies<TRepositories, TServices> {
  readonly useCases: Readonly<TUseCases>;
}

/**
 * Função fábrica que recebe abstrações de contratos e retorna o contrato de um Use Case.
 */
export type UseCaseFactory<TDependencies, TUseCaseContract extends object> = (
  dependencies: TDependencies,
) => TUseCaseContract;

/**
 * Definição estrutural de como a infraestrutura concreta e os Use Cases são instanciados.
 */
export interface ContainerDefinition<
  TRepositories extends object = RepositoryRegistry,
  TServices extends object = ServiceRegistry,
  TUseCases extends object = UseCaseRegistry,
> {
  readonly repositories: () => TRepositories;
  readonly services: () => TServices;
  readonly useCases: (
    infra: InfrastructureDependencies<TRepositories, TServices>,
  ) => TUseCases;
}

/**
 * Substituições opcionais para trocar repositórios, serviços ou Use Cases concretos
 * por test doubles (mocks, stubs, fakes ou spies) durante testes automatizados.
 */
export interface ContainerOverrides<
  TRepositories extends object = RepositoryRegistry,
  TServices extends object = ServiceRegistry,
  TUseCases extends object = UseCaseRegistry,
> {
  readonly repositories?: Partial<TRepositories>;
  readonly services?: Partial<TServices>;
  readonly useCases?: Partial<TUseCases>;
}

/**
 * Instancia um Use Case injetando suas dependências de contrato (`model`)
 * e retornando estritamente seu contrato público (`I*UseCases`).
 */
export function composeUseCase<TDependencies, TUseCaseContract extends object>(
  factory: UseCaseFactory<TDependencies, TUseCaseContract>,
  dependencies: TDependencies,
): TUseCaseContract {
  return factory(dependencies);
}

/**
 * Resolve a dependência do Use Case em uma ViewModel, priorizando um test double
 * injetado (`override`) e utilizando a instância padrão do container como fallback.
 */
export function resolveUseCase<TUseCaseContract extends object>(
  override: TUseCaseContract | undefined,
  defaultUseCase: TUseCaseContract,
): TUseCaseContract {
  return override ?? defaultUseCase;
}

/**
 * Constrói um `DependencyContainer` imutável a partir de uma definição e substituições opcionais.
 *
 * Quando substituições de infraestrutura (`repositories` ou `services`) são fornecidas,
 * os Use Cases são automaticamente compostos com esses test doubles sem exigir
 * alterações nos consumidores (Use Cases ou ViewModels).
 */
export function createContainer<
  TRepositories extends object,
  TServices extends object,
  TUseCases extends object,
>(
  definition: ContainerDefinition<TRepositories, TServices, TUseCases>,
  overrides: ContainerOverrides<TRepositories, TServices, TUseCases> = {},
): DependencyContainer<TRepositories, TServices, TUseCases> {
  const repositories = Object.freeze({
    ...definition.repositories(),
    ...overrides.repositories,
  }) as Readonly<TRepositories>;

  const services = Object.freeze({
    ...definition.services(),
    ...overrides.services,
  }) as Readonly<TServices>;

  const infra: InfrastructureDependencies<TRepositories, TServices> =
    Object.freeze({
      repositories,
      services,
    });

  const useCases = Object.freeze({
    ...definition.useCases(infra),
    ...overrides.useCases,
  }) as Readonly<TUseCases>;

  return Object.freeze({
    repositories,
    services,
    useCases,
  });
}

/** Repositórios da aplicação. */
export type AppRepositories = {
  dailyActivity: IDailyActivityRepository;
  tasks: ITaskRepository;
  activityCatalog: IActivityCatalog;
};

/** Serviços da aplicação. */
export type AppServices = {
  clock: IClockService;
};

/** Casos de uso expostos às ViewModels. */
export type AppUseCases = {
  streak: IStreakUseCases;
  home: IHomeUseCases;
  tasks: ITaskUseCases;
};

/**
 * Definição do composition root da aplicação. Criar o container não abre o banco:
 * o `DatabaseProvider` só abre no primeiro uso.
 */
export const appContainerDefinition: ContainerDefinition<AppRepositories, AppServices, AppUseCases> =
  Object.freeze({
    repositories: () => createPersistence(),
    services: () => ({ clock: new SystemClockService() }),
    useCases: ({ repositories, services }: InfrastructureDependencies<AppRepositories, AppServices>) => ({
      streak: composeUseCase(
        ({ dailyActivity, clock }: { dailyActivity: IDailyActivityRepository; clock: IClockService }) =>
          new StreakUseCases(dailyActivity, clock),
        { dailyActivity: repositories.dailyActivity, clock: services.clock },
      ),
      home: composeUseCase(
        (deps: { dailyActivity: IDailyActivityRepository; activityCatalog: IActivityCatalog; clock: IClockService }) =>
          new HomeUseCases(deps.dailyActivity, deps.activityCatalog, deps.clock),
        {
          dailyActivity: repositories.dailyActivity,
          activityCatalog: repositories.activityCatalog,
          clock: services.clock,
        },
      ),
      tasks: composeUseCase(
        (deps: { tasks: ITaskRepository; dailyActivity: IDailyActivityRepository; clock: IClockService }) =>
          new TaskUseCases(deps.tasks, deps.dailyActivity, deps.clock),
        {
          tasks: repositories.tasks,
          dailyActivity: repositories.dailyActivity,
          clock: services.clock,
        },
      ),
    }),
  });

/**
 * Cria um container isolado da aplicação, permitindo a substituição parcial de
 * repositórios, serviços ou Use Cases por test doubles.
 */
export function createAppContainer(
  overrides: ContainerOverrides<AppRepositories, AppServices, AppUseCases> = {},
): DependencyContainer<AppRepositories, AppServices, AppUseCases> {
  return createContainer(appContainerDefinition, overrides);
}

/**
 * Instância singleton padrão do Composition Root consumida pelas ViewModels em produção.
 */
export const container = createAppContainer();
