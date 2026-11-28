import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { IProfileUseCases } from "@/usecase/iProfileUseCases";
import { ProfileUseCases } from "@/usecase/profileUseCases";

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

import { ExpoNotificationService } from "@/infra/services/expoNotificationService";
import { NativeExternalLinkService } from "@/infra/services/nativeExternalLinkService";
import type { IExternalLinkService } from "@/model/services/iExternalLinkService";
import type { IPrivacyUseCases } from "@/usecase/iPrivacyUseCases";
import { PrivacyUseCases } from "@/usecase/privacyUseCases";
import { SystemClockService } from "@/infra/services/systemClockService";
import { SystemDayChangeService } from "@/infra/services/systemDayChangeService";
import type { IActivityDataSource } from "@/model/datasources/iActivityDataSource";
import type { ICategoryDataSource } from "@/model/datasources/iCategoryDataSource";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IFocusSessionDataSource } from "@/model/datasources/iFocusSessionDataSource";
import type { IRoutineDataSource } from "@/model/datasources/iRoutineDataSource";
import type { IStarDataSource } from "@/model/datasources/iStarDataSource";
import type { ITaskDataSource } from "@/model/datasources/iTaskDataSource";
import type { IClockService } from "@/model/services/iClockService";
import type { IDayChangeService } from "@/model/services/iDayChangeService";
import type { INotificationService } from "@/model/services/iNotificationService";
import { CategoryUseCases } from "@/usecase/categoryUseCases";
import { FocusUseCases } from "@/usecase/focusUseCases";
import { HomeUseCases } from "@/usecase/homeUseCases";
import type { ICategoryUseCases } from "@/usecase/iCategoryUseCases";
import type { IFocusUseCases } from "@/usecase/iFocusUseCases";
import type { IHomeUseCases } from "@/usecase/iHomeUseCases";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";
import type { IRoutineUseCases } from "@/usecase/iRoutineUseCases";
import type { IStreakUseCases } from "@/usecase/iStreakUseCases";
import type { ITaskUseCases } from "@/usecase/iTaskUseCases";
import { NotificationUseCases } from "@/usecase/notificationUseCases";
import { RoutineUseCases } from "@/usecase/routineUseCases";
import { StreakUseCases } from "@/usecase/streakUseCases";
import { TaskUseCases } from "@/usecase/taskUseCases";
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
  stars: IStarDataSource;
  tasks: ITaskDataSource;
  routines: IRoutineDataSource;
  categories: ICategoryDataSource;
  focusSessions: IFocusSessionDataSource;
  activities: IActivityDataSource;
  profile: IProfileDataSource;
};

/** Serviços da aplicação. */
export type AppServices = {
  externalLinks: IExternalLinkService;
  clock: IClockService;
  dayChange: IDayChangeService;
  notifications: INotificationService;
};

/** Casos de uso expostos às ViewModels. */
export type AppUseCases = {
  privacy: IPrivacyUseCases;
  streak: IStreakUseCases;
  home: IHomeUseCases;
  focus: IFocusUseCases;
  tasks: ITaskUseCases;
  profile: IProfileUseCases;
  routines: IRoutineUseCases;
  categories: ICategoryUseCases;
  notifications: INotificationUseCases;
};

/**
 * Definição do composition root da aplicação. Criar o container não abre o banco:
 * o `DatabaseProvider` só abre no primeiro uso.
 */
export const appContainerDefinition: ContainerDefinition<AppDataSources, AppServices, AppUseCases> =
  Object.freeze({
    dataSources: () => createPersistence(),
    services: () => {
      const clock = new SystemClockService();
      return {
        externalLinks: new NativeExternalLinkService(),
        clock,
        dayChange: new SystemDayChangeService(clock),
        notifications: new ExpoNotificationService(),
      };
    },
    useCases: ({ dataSources, services }: InfrastructureDependencies<AppDataSources, AppServices>) => ({
      privacy: composeUseCase(
        (externalLinks: IExternalLinkService) => new PrivacyUseCases(externalLinks),
        services.externalLinks,
      ),
      streak: composeUseCase(
        ({
          dailyActivity,
          clock,
          stars,
        }: {
          dailyActivity: IDailyActivityDataSource;
          clock: IClockService;
          stars: IStarDataSource;
        }) => new StreakUseCases(dailyActivity, clock, stars),
        { dailyActivity: dataSources.dailyActivity, clock: services.clock, stars: dataSources.stars },
      ),
      home: composeUseCase(
        (deps: {
          dailyActivity: IDailyActivityDataSource;
          activities: IActivityDataSource;
          clock: IClockService;
          dayChange: IDayChangeService;
          stars: IStarDataSource;
          focusSessions: IFocusSessionDataSource;
        }) =>
          new HomeUseCases(
            deps.dailyActivity,
            deps.activities,
            deps.clock,
            deps.dayChange,
            deps.stars,
            deps.focusSessions,
          ),
        {
          dailyActivity: dataSources.dailyActivity,
          activities: dataSources.activities,
          clock: services.clock,
          dayChange: services.dayChange,
          stars: dataSources.stars,
          focusSessions: dataSources.focusSessions,
        },
      ),
      focus: composeUseCase(
        (deps: {
          focusSessions: IFocusSessionDataSource;
          activities: IActivityDataSource;
          clock: IClockService;
          notifications: INotificationService;
          dailyActivity: IDailyActivityDataSource;
        }) =>
          new FocusUseCases(
            deps.focusSessions,
            deps.activities,
            deps.clock,
            deps.notifications,
            undefined,
            deps.dailyActivity,
          ),
        {
          focusSessions: dataSources.focusSessions,
          activities: dataSources.activities,
          clock: services.clock,
          notifications: services.notifications,
          dailyActivity: dataSources.dailyActivity,
        },
      ),
      tasks: composeUseCase(
        (deps: {
          tasks: ITaskDataSource;
          dailyActivity: IDailyActivityDataSource;
          clock: IClockService;
          stars: IStarDataSource;
          categories: ICategoryDataSource;
          notifications: INotificationService;
          focusSessions: IFocusSessionDataSource;
        }) =>
          new TaskUseCases(
            deps.tasks,
            deps.dailyActivity,
            deps.clock,
            undefined,
            deps.stars,
            deps.categories,
            deps.notifications,
            deps.focusSessions,
          ),
        {
          tasks: dataSources.tasks,
          dailyActivity: dataSources.dailyActivity,
          clock: services.clock,
          stars: dataSources.stars,
          categories: dataSources.categories,
          notifications: services.notifications,
          focusSessions: dataSources.focusSessions,
        },
      ),
      profile: composeUseCase(
        (deps: { profile: IProfileDataSource; dailyActivity: IDailyActivityDataSource; clock: IClockService }) =>
          new ProfileUseCases(deps.profile, deps.dailyActivity, deps.clock),
        { profile: dataSources.profile, dailyActivity: dataSources.dailyActivity, clock: services.clock },
      ),
      routines: composeUseCase(
        (deps: {
          routines: IRoutineDataSource;
          tasks: ITaskDataSource;
          dailyActivity: IDailyActivityDataSource;
          clock: IClockService;
          dayChange: IDayChangeService;
          stars: IStarDataSource;
          categories: ICategoryDataSource;
          focusSessions: IFocusSessionDataSource;
          notifications: INotificationService;
        }) =>
          new RoutineUseCases(
            deps.routines,
            deps.tasks,
            deps.dailyActivity,
            deps.clock,
            undefined,
            deps.dayChange,
            deps.stars,
            deps.categories,
            deps.focusSessions,
            deps.notifications,
          ),
        {
          routines: dataSources.routines,
          tasks: dataSources.tasks,
          dailyActivity: dataSources.dailyActivity,
          clock: services.clock,
          dayChange: services.dayChange,
          stars: dataSources.stars,
          categories: dataSources.categories,
          focusSessions: dataSources.focusSessions,
          notifications: services.notifications,
        },
      ),
      categories: composeUseCase(
        (deps: { categories: ICategoryDataSource; clock: IClockService }) =>
          new CategoryUseCases(deps.categories, deps.clock),
        { categories: dataSources.categories, clock: services.clock },
      ),
      notifications: composeUseCase(
        (deps: { notifications: INotificationService }) => new NotificationUseCases(deps.notifications),
        { notifications: services.notifications },
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
