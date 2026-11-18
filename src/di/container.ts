import { MemoryProfileDataSource } from "@/infra/datasources/memoryProfileDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import { type IProfileUseCases, ProfileUseCases } from "@/usecase/profileUseCases";

/**
 * Composition Root e Container de Injeção de Dependências (`src/di/container.ts`).
 *
 * Conecta implementações concretas de `src/infra/` aos casos de uso em `src/usecase/`
 * por meio dos contratos de domínio de `src/model/`, e fornece contratos de Use Cases
 * para as ViewModels em `src/viewmodel/`.
 *
 * Direção de dependências assegurada por este módulo:
 * View -> ViewModel -> Use Cases -> Domínio (Model) <- Infraestrutura
 */

import { SystemClockService } from "@/infra/services/systemClockService";
import type { IActivityDataSource } from "@/model/datasources/iActivityDataSource";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IRoutineDataSource } from "@/model/datasources/iRoutineDataSource";
import type { ITaskDataSource } from "@/model/datasources/iTaskDataSource";
import type { IClockService } from "@/model/services/iClockService";
import { HomeUseCases } from "@/usecase/homeUseCases";
import type { IHomeUseCases } from "@/usecase/iHomeUseCases";
import type { IRoutineUseCases } from "@/usecase/iRoutineUseCases";
import type { IStreakUseCases } from "@/usecase/iStreakUseCases";
import type { ITaskUseCases } from "@/usecase/iTaskUseCases";
import { RoutineUseCases } from "@/usecase/routineUseCases";
import { StreakUseCases } from "@/usecase/streakUseCases";
import { TaskUseCases } from "@/usecase/taskUseCases";
// Resolvido pelo Metro: persistence.ts no Android e persistence.web.ts na web (D8).
import { createPersistence } from "./persistence";

/**
 * Registro de contratos de DataSources de domínio (`src/model/datasources/`).
 * Expandido conforme os épicos funcionais introduzem DataSources concretos em `src/infra/datasources/`.
 */
export type DataSourceRegistry = Record<string, unknown>;

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
  TDataSources extends object = DataSourceRegistry,
  TServices extends object = ServiceRegistry,
> {
  readonly dataSources: Readonly<TDataSources>;
  readonly services: Readonly<TServices>;
}

/**
 * Container imutável de Injeção de Dependências que expõe as camadas compostas.
 */
export interface DependencyContainer<
  TDataSources extends object = DataSourceRegistry,
  TServices extends object = ServiceRegistry,
  TUseCases extends object = UseCaseRegistry,
> extends InfrastructureDependencies<TDataSources, TServices> {
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
  TDataSources extends object = DataSourceRegistry,
  TServices extends object = ServiceRegistry,
  TUseCases extends object = UseCaseRegistry,
> {
  readonly dataSources: () => TDataSources;
  readonly services: () => TServices;
  readonly useCases: (
    infra: InfrastructureDependencies<TDataSources, TServices>,
  ) => TUseCases;
}

/**
 * Substituições opcionais para trocar DataSources, serviços ou Use Cases concretos
 * por test doubles (mocks, stubs, fakes ou spies) durante testes automatizados.
 */
export interface ContainerOverrides<
  TDataSources extends object = DataSourceRegistry,
  TServices extends object = ServiceRegistry,
  TUseCases extends object = UseCaseRegistry,
> {
  readonly dataSources?: Partial<TDataSources>;
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
 * Quando substituições de infraestrutura (`dataSources` ou `services`) são fornecidas,
 * os Use Cases são automaticamente compostos com esses test doubles sem exigir
 * alterações nos consumidores (Use Cases ou ViewModels).
 */
export function createContainer<
  TDataSources extends object,
  TServices extends object,
  TUseCases extends object,
>(
  definition: ContainerDefinition<TDataSources, TServices, TUseCases>,
  overrides: ContainerOverrides<TDataSources, TServices, TUseCases> = {},
): DependencyContainer<TDataSources, TServices, TUseCases> {
  const dataSources = Object.freeze({
    ...definition.dataSources(),
    ...overrides.dataSources,
  }) as Readonly<TDataSources>;

  const services = Object.freeze({
    ...definition.services(),
    ...overrides.services,
  }) as Readonly<TServices>;

  const infra: InfrastructureDependencies<TDataSources, TServices> =
    Object.freeze({
      dataSources,
      services,
    });

  const useCases = Object.freeze({
    ...definition.useCases(infra),
    ...overrides.useCases,
  }) as Readonly<TUseCases>;

  return Object.freeze({
    dataSources,
    services,
    useCases,
  });
}

/** DataSources da aplicação. */
export type AppDataSources = {
  dailyActivity: IDailyActivityDataSource;
  tasks: ITaskDataSource;
  routines: IRoutineDataSource;
  activities: IActivityDataSource;
  profile: IProfileDataSource;
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
  profile: IProfileUseCases;
  routines: IRoutineUseCases;
};

/**
 * Definição do composition root da aplicação. Criar o container não abre o banco:
 * o `DatabaseProvider` só abre no primeiro uso.
 */
export const appContainerDefinition: ContainerDefinition<AppDataSources, AppServices, AppUseCases> =
  Object.freeze({
    dataSources: () => ({
      ...createPersistence(),
      // Perfil ainda sem persistência: memória em todas as plataformas.
      profile: new MemoryProfileDataSource(),
    }),
    services: () => ({ clock: new SystemClockService() }),
    useCases: ({ dataSources, services }: InfrastructureDependencies<AppDataSources, AppServices>) => ({
      streak: composeUseCase(
        ({ dailyActivity, clock }: { dailyActivity: IDailyActivityDataSource; clock: IClockService }) =>
          new StreakUseCases(dailyActivity, clock),
        { dailyActivity: dataSources.dailyActivity, clock: services.clock },
      ),
      home: composeUseCase(
        (deps: { dailyActivity: IDailyActivityDataSource; activities: IActivityDataSource; clock: IClockService }) =>
          new HomeUseCases(deps.dailyActivity, deps.activities, deps.clock),
        {
          dailyActivity: dataSources.dailyActivity,
          activities: dataSources.activities,
          clock: services.clock,
        },
      ),
      tasks: composeUseCase(
        (deps: { tasks: ITaskDataSource; dailyActivity: IDailyActivityDataSource; clock: IClockService }) =>
          new TaskUseCases(deps.tasks, deps.dailyActivity, deps.clock),
        {
          tasks: dataSources.tasks,
          dailyActivity: dataSources.dailyActivity,
          clock: services.clock,
        },
      ),
      profile: composeUseCase(
        ({ profile }: { profile: IProfileDataSource }) => new ProfileUseCases(profile),
        { profile: dataSources.profile },
      ),
      routines: composeUseCase(
        (deps: {
          routines: IRoutineDataSource;
          tasks: ITaskDataSource;
          dailyActivity: IDailyActivityDataSource;
          clock: IClockService;
        }) => new RoutineUseCases(deps.routines, deps.tasks, deps.dailyActivity, deps.clock),
        {
          routines: dataSources.routines,
          tasks: dataSources.tasks,
          dailyActivity: dataSources.dailyActivity,
          clock: services.clock,
        },
      ),
    }),
  });

/**
 * Cria um container isolado da aplicação, permitindo a substituição parcial de
 * DataSources, serviços ou Use Cases por test doubles.
 */
export function createAppContainer(
  overrides: ContainerOverrides<AppDataSources, AppServices, AppUseCases> = {},
): DependencyContainer<AppDataSources, AppServices, AppUseCases> {
  return createContainer(appContainerDefinition, overrides);
}

/**
 * Instância singleton padrão do Composition Root consumida pelas ViewModels em produção.
 */
export const container = createAppContainer();
