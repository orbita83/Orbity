# DI (Composition Root)

## Overview

`src/di/` contém o **Composition Root** do Orbity, implementado em um único módulo, `container.ts`, sem frameworks externos de injeção de dependências. O módulo conecta implementações concretas de `src/infra/` aos casos de uso de `src/usecase/` por meio dos contratos de domínio de `src/model/`, e fornece os contratos de Use Cases consumidos pelas ViewModels em `src/viewmodel/`.

Direção de dependências assegurada (conforme o cabeçalho de `container.ts`):

```text
View -> ViewModel -> Use Cases -> Domínio (Model) <- Infraestrutura
```

No estado atual, `appContainerDefinition` registra fábricas vazias (`dataSources: () => ({})`, `services: () => ({})`, `useCases: () => ({})`); os registros são expandidos conforme os épicos funcionais introduzem implementações concretas. As regras completas de composição estão em [ARCHITECTURE.md, Seção 6](../../ARCHITECTURE.md).

## Interface

Todos os símbolos são exportados por `container.ts`.

### Tipos

- `DataSourceRegistry` — alias de `Record<string, unknown>`; registro de contratos de DataSources de domínio (`src/model/datasources/`).
- `ServiceRegistry` — alias de `Record<string, unknown>`; registro de contratos de serviços de domínio (`src/model/services/`).
- `UseCaseRegistry` — alias de `Record<string, unknown>`; registro de contratos de casos de uso (`src/usecase/`).
- `InfrastructureDependencies<TDataSources, TServices>` — agrupa `readonly dataSources: Readonly<TDataSources>` e `readonly services: Readonly<TServices>`, injetados nos Use Cases.
- `DependencyContainer<TDataSources, TServices, TUseCases>` — estende `InfrastructureDependencies` e adiciona `readonly useCases: Readonly<TUseCases>`.
- `UseCaseFactory<TDependencies, TUseCaseContract>` — função `(dependencies: TDependencies) => TUseCaseContract`.
- `ContainerDefinition<TDataSources, TServices, TUseCases>` — fábricas `dataSources: () => TDataSources`, `services: () => TServices` e `useCases: (infra: InfrastructureDependencies<...>) => TUseCases`.
- `ContainerOverrides<TDataSources, TServices, TUseCases>` — substituições opcionais `dataSources?`, `services?` e `useCases?` (cada uma `Partial<...>`) para test doubles.

Todos os parâmetros genéricos têm como padrão `DataSourceRegistry`, `ServiceRegistry` e `UseCaseRegistry`, exceto em `UseCaseFactory`.

### Funções

- `composeUseCase(factory, dependencies): TUseCaseContract` — invoca `factory(dependencies)` e retorna o contrato público do Use Case.
- `resolveUseCase(override, defaultUseCase): TUseCaseContract` — retorna `override ?? defaultUseCase`; usado pelas ViewModels para priorizar um test double injetado.
- `createContainer(definition, overrides = {}): DependencyContainer<...>` — constrói um container imutável a partir de uma `ContainerDefinition` e de `ContainerOverrides` opcionais.
- `createAppContainer(overrides = {}): DependencyContainer<DataSourceRegistry, ServiceRegistry, UseCaseRegistry>` — atalho para `createContainer(appContainerDefinition, overrides)`, gerando um container isolado da aplicação.

### Constantes

- `appContainerDefinition` — `ContainerDefinition` base da aplicação, congelada com `Object.freeze`.
- `container` — instância singleton padrão, criada por `createAppContainer()`, consumida pelas ViewModels em produção.

### Subdiretórios

- Nenhum.

## Invariants

- **Imutabilidade:** `createContainer` aplica `Object.freeze` ao objeto `dataSources`, ao objeto `services`, ao objeto interno `infra`, ao objeto `useCases` e ao container retornado. `appContainerDefinition` também é congelada. O congelamento é raso: os objetos registrados em cada entrada não são congelados.
- **Precedência das substituições:** em cada registro, as entradas de `overrides` são espalhadas depois das entradas produzidas pela `definition` (`{ ...definition.dataSources(), ...overrides.dataSources }`, e o mesmo vale para `services` e `useCases`); portanto, uma substituição prevalece sobre a entrada padrão de mesma chave (merge raso por chave).
- **Recomposição automática:** `definition.useCases(infra)` recebe `infra` construído com `dataSources` e `services` já mesclados com as substituições; assim, test doubles de infraestrutura são injetados nos Use Cases sem alterar os consumidores.
- **Ordem de construção:** dentro de `createContainer`, `definition.dataSources()` e `definition.services()` são chamados antes de `definition.useCases(infra)`, e cada fábrica é chamada exatamente uma vez por chamada a `createContainer`.
- **Resolução na ViewModel:** `resolveUseCase` retorna `defaultUseCase` somente quando `override` é `null` ou `undefined` (operador `??`).
- **Fronteira de acoplamento (ARCHITECTURE.md, Seção 6.1):** `container.ts` é o único módulo autorizado a importar simultaneamente implementações concretas de `src/infra/` e classes concretas de `src/usecase/`. Use Cases nunca importam `src/di/container.ts`, e a View (`src/view/`) não conhece `src/di/`.

## Side Effects

- Na carga do módulo, `export const container = createAppContainer()` executa as fábricas de `appContainerDefinition` e cria a instância singleton. Com as fábricas atuais (que retornam objetos vazios), não há E/S, rede ou acesso a disco.
- Nenhuma outra operação de E/S, rede, disco ou estado global além da criação do singleton `container`.

## Verification

- Run: `npm test`
- Não existem testes dedicados a `src/di/` no momento; as estratégias de teste do container estão descritas em `docs/06-quality/guia-testes.md` (Seção 6.5) e em `ARCHITECTURE.md` (Seções 6.2 e 6.3).
