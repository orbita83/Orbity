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

/**
 * Definição base do composition root da aplicação.
 * Implementações concretas de infraestrutura (`src/infra/`) e casos de uso (`src/usecase/`)
 * são registrados aqui conforme os épicos funcionais são implementados.
 */
export const appContainerDefinition: ContainerDefinition<
  RepositoryRegistry,
  ServiceRegistry,
  UseCaseRegistry
> = Object.freeze({
  repositories: () => ({}),
  services: () => ({}),
  useCases: () => ({}),
});

/**
 * Cria um container isolado da aplicação, permitindo a substituição parcial de
 * repositórios, serviços ou Use Cases por test doubles.
 */
export function createAppContainer(
  overrides: ContainerOverrides<
    RepositoryRegistry,
    ServiceRegistry,
    UseCaseRegistry
  > = {},
): DependencyContainer<RepositoryRegistry, ServiceRegistry, UseCaseRegistry> {
  return createContainer(appContainerDefinition, overrides);
}

/**
 * Instância singleton padrão do Composition Root consumida pelas ViewModels em produção.
 */
export const container = createAppContainer();
