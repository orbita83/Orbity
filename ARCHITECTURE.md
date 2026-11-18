# Guia Completo: MVVM Sofisticado (Capítulo 10)

> **Fonte:** *Tutoriais de PDM: Desenvolvimento Mobile com React Native e Expo*  
> **Capítulo 10:** *MVVM Sofisticado com React Native, TypeScript e Expo* (versão V5, pp. 135–171)

---

## 1. Visão Geral e Evolução

O **MVVM Sofisticado** evolui o padrão simplificado (vista no Capítulo 8) incorporando princípios fundamentais da Engenharia de Software, como **Clean Architecture**, **Inversão de Dependências (DIP)** e **Testabilidade Unitária**.

### Diferenças Principais: MVVM Simplificado vs. Sofisticado

| Aspecto | MVVM Simplificado (Cap. 8) | MVVM Sofisticado (Cap. 10) |
| :--- | :--- | :--- |
| **ViewModel** | Concentra estado da tela + chamadas diretas a serviços. | Gerencia **apenas o estado da tela**; delega toda lógica aos *Use Cases*. |
| **Regras de Negócio** | Misturadas na ViewModel ou no Serviço. | Isoladas exclusivamente na camada de **Use Cases**. |
| **Model** | Continha entidades e serviços concretos. | Contém **apenas entidades puras e interfaces (contratos)**. |
| **Acesso a Dados** | Direto nos serviços/DataSources dentro do Model. | Isolado na camada de **Infraestrutura** (*Firebase, SQLite, REST, Memory*). |
| **Dependências** | Classes concretas importadas diretamente. | **Inversão de Dependência (DIP)** via interfaces e Container de Injeção (*DI*). |

---

## 2. As 5 Camadas do MVVM Sofisticado

```
View  -->  ViewModel  -->  Use Cases  -->  Domínio (Model)  <--  Infraestrutura
```

1. **View (Interface):** Componentes e telas React Native. Responsável apenas por renderizar estado e disparar ações (*fire-and-forget*). Não possui blocos `try/catch` nem regras de negócio e **não chama hooks de navegação**.
2. **ViewModel (Apresentação):** Custom Hooks que gerenciam estado de interface (`loading`, `error`, `data`), expõem funções de ação (retorno em tupla `[state, actions]`, com os tipos `XState` e `XActions` exportados) e **cuidam da navegação** (`router` do `expo-router`, parâmetros de rota e foco da tela). Depende **apenas de abstrações** (interfaces de Use Cases).
3. **Use Cases (Casos de Uso / Orquestração):** Contratos (`I*UseCase` / `I*UseCases`) e implementações de regras de negócio puras e validações do sistema. Orquestram DataSources e serviços exclusivamente através de interfaces do domínio.
4. **Domínio / Model (Core do Negócio):** Entidades puras (`src/model/entities/`), erros de domínio (`src/model/errors.ts`), interfaces de DataSources (`src/model/datasources/`) e interfaces de serviços (`src/model/services/`). **Zero dependência de bibliotecas externas** (React, Expo, SDKs).
5. **Infraestrutura:**
   Implementa:
   - **Services concretos** (`src/infra/services/`, ex.: adapters de relógio, notificações ou APIs);
   - **DataSources concretos** (`src/infra/datasources/`, ex.: implementações em memória ou armazenamento local);
   - **Mapeamentos** para converter dados externos em entidades do domínio.

   > **Regra de Ouro da Infraestrutura:** A Infra nunca propaga erros específicos. Sempre converte para erros puros definidos no domínio.

   > **Nota — DataSource, Service e Use Case:**
   > - **DataSource (Infra):** Lida com persistência e busca de dados brutos (memória, banco local, Firestore, API) e os mapeia para entidades do domínio.
   > - **Service (Infra):** Lida com integrações e capacidades externas (autenticação, notificações, sensores, câmera).
   > - **Use Case:** Coordena e aplica as regras de negócio sobre as interfaces de `Service` e `DataSource`, sem saber qual tecnologia concreta está por baixo.

---

## 3. Estrutura de Pastas Materializada

```
└── src/
    ├── app/                  # Módulos de rota do Expo Router (kebab-case.tsx)
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── infra/                # Implementações concretas (Infraestrutura)
    │   ├── database/         # Porta ISqlExecutor, executor do expo-sqlite, migrações e DatabaseProvider (ADR-0001)
    │   ├── datasources/      # DataSources concretos (ex.: Memory, SQLite, Firestore)
    │   └── services/         # Serviços concretos de integração externa
    ├── model/                # Camada de Domínio Puro (zero dependências externas)
    │   ├── entities/         # Entidades e tipos puros de domínio
    │   ├── errors.ts         # Erros puros de domínio: DomainError e subclasses
    │   ├── datasources/      # Contratos (interfaces) de DataSources
    │   └── services/         # Contratos (interfaces) de serviços externos
    ├── usecase/              # Casos de Uso (contratos I*UseCases e implementações)
    ├── view/                 # Telas em kebab-case.tsx, com o mesmo nome da rota em app/
    │   ├── components/       # Componentes reutilizáveis de interface (PascalCase.tsx)
    │   └── theme/            # Tokens visuais e temas do Design System
    ├── viewmodel/            # Custom Hooks de estado e apresentação (use*ViewModel.ts)
    └── di/                   # Ponto de composição e Injeção de Dependências
        ├── container.ts      # Composition Root mínimo e fábricas de composição
        ├── persistence.ts    # Persistência no Android: SQLite (ADR-0001)
        └── persistence.web.ts # Persistência na web: em memória, escolhida pelo Metro
```

### 3.1. Limites Arquiteturais e Regras de Dependência

O alias `@/*` aponta para `./src/*` (`tsconfig.json`).

| Camada (`src/`) | Responsabilidade e Limite Estrito | Dependências Permitidas | Dependências Proibidas |
| :--- | :--- | :--- | :--- |
| **`app/`** | Módulos de rota do Expo Router. Apenas importam e re-exportam como `default` as telas de `src/view/`. | `src/view/`, `expo-router` | `viewmodel/`, `usecase/`, `model/`, `infra/`, `di/` |
| **`view/`** | Componentes visuais (`components/`), telas (`kebab-case.tsx`, com o mesmo nome da rota em `src/app/`) e tokens (`theme/`). Renderiza estado e dispara ações sem `try/catch` ou regras. | `src/viewmodel/`, `src/view/`, React Native, tokens do Design System, **tipos** de entidade de `src/model/entities/` usados no estado (`import type`; testes e histórias podem usar o domínio para montar dados) | `usecase/`, funções, contratos e erros de `model/`, `infra/`, `di/`, hooks e componentes de navegação do `expo-router` (exceto a `MainTabBar`, que recebe `navigation` por props do `<Tabs />`) |
| **`viewmodel/`** | Custom Hooks em arquivos `camelCase` com o mesmo nome do hook exportado (`use*ViewModel.ts`, expondo `use*ViewModel`) que gerenciam estado de UI (`loading`, `error`, dados) e orquestram chamadas aos contratos de Use Cases. | Contratos `I*UseCases` (`src/usecase/`), `src/model/entities/`, `src/model/errors.ts` (para tratar `DomainError` e suas subclasses), `src/di/container.ts`, React hooks, `expo-router` (`router`, `useLocalSearchParams`, `useFocusEffect`, `useNavigation`) | Classes concretas de `usecase/`, `model/datasources/`, `model/services/`, `infra/` |
| **`usecase/`** | Contratos (`I*UseCases`) e implementações (`*UseCases`) de regras de negócio e validações. Recebem dependências via construtor. | `src/model/` (`entities/`, `errors.ts`, `datasources/`, `services/`) | `app/`, `view/`, `viewmodel/`, `infra/`, `di/`, React Native, Expo, SDKs externos |
| **`model/`** | Núcleo de domínio puro: entidades (`entities/`), erros (`errors.ts`) e contratos (`datasources/`, `services/`). | Apenas módulos internos do próprio `src/model/` | Qualquer outra camada (`app`, `view`, `viewmodel`, `usecase`, `infra`, `di`) ou biblioteca externa |
| **`infra/`** | DataSources (`datasources/`) e serviços (`services/`) concretos, adapters e mapeadores de dados externos para o domínio. | Contratos, entidades e erros de `src/model/`, SDKs/APIs externas | `app/`, `view/`, `viewmodel/`, `usecase/`, `di/` |
| **`di/`** | Composition Root (`container.ts`). Único ponto autorizado a instanciar e conectar `infra/` e `usecase/`. | `src/infra/`, `src/usecase/`, `src/model/` | `app/`, `view/`, `viewmodel/` |

---

## 4. Contratos, Inversão de Dependências (DIP) e Adapters

### 4.1. Convenções de Contratos e Implementações

1. **Contratos de Domínio (`src/model/datasources/` e `src/model/services/`):**
   - Definem interfaces puras prefixadas com `I` (`IClockService`, `IDataSource`), operando apenas com tipos primitivos, entidades de `src/model/entities/` e erros de `src/model/errors.ts`.
   - Não expõem DTOs externos, tipos de banco de dados, objetos HTTP ou detalhes de bibliotecas.
2. **Contratos e Orquestração de Use Cases (`src/usecase/`):**
   - Cada caso de uso expõe uma interface pública (`I*UseCases` ou `I*UseCase`) consumida pela ViewModel e uma classe concreta (`*UseCases` ou `*UseCase`) que depende exclusivamente das interfaces de `src/model/` injetadas via construtor.
3. **Repositórios, Services e Adapters na Infraestrutura (`src/infra/`):**
   - Classes em `src/infra/datasources/` e `src/infra/services/` atuam como **adapters**: implementam explicitamente (`implements`) as interfaces de `src/model/`, convertem estruturas brutas externas (JSON, linhas SQLite, SDKs) em entidades puras de `src/model/entities/` e traduzem falhas técnicas na subclasse de erro de `src/model/errors.ts` do seu tipo.

### 4.2. Fluxo entre Camadas (Exemplo Técnico Neutro)

Os trechos abaixo ilustram a comunicação ponta a ponta entre as camadas com o mecanismo de composição de `src/di/container.ts`, sem antecipar regras de negócio de produto. A entidade `TimestampRecord`, o caso de uso `TimestampUseCase`, a ViewModel `useTimestampViewModel` e a tela `timestamp` são didáticos e não existem no código. Os demais trechos (`errors.ts`, `IClockService`, `SystemClockService`, `toDataSourceError` e o container) reproduzem o código real.

```typescript
// 1. Domínio Puro — Entidade, Erro e Contrato (src/model/)
// src/model/entities/timestamp-record.ts (didático)
export interface TimestampRecord {
  readonly label: string;
  readonly isoDate: string;
}

// src/model/errors.ts (real, resumido)
// O tipo da falha é a própria subclasse: não há código nem flag de nova tentativa.
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

// Entrada que viola uma regra de negócio.
export class ValidationError extends DomainError { /* name = "ValidationError" */ }

// Falha técnica ao guardar ou ler dados. Admite nova tentativa.
export class DataSourceError extends DomainError { /* mensagem padrão + name */ }

// Banco gravado por uma versão mais nova do app. Não admite nova tentativa (D14).
export class SchemaVersionError extends DomainError { /* mensagem padrão + name */ }

// src/model/services/i-clock-service.ts (real)
import type { LocalDate } from "@/model/entities/local-date";

export interface IClockService {
  /** Instante atual em ISO-8601 com o deslocamento do fuso (ex.: 2026-11-14T23:59:00-03:00). */
  now(): string;
  /** Data de calendário local do aparelho. */
  todayLocal(): LocalDate;
}
```

```typescript
// 2. Caso de Uso — Contrato e Implementação (src/usecase/timestamp-use-case.ts, didático)
import type { TimestampRecord } from "@/model/entities/timestamp-record";
import { ValidationError } from "@/model/errors";
import type { IClockService } from "@/model/services/i-clock-service";

export interface ITimestampUseCase {
  createRecord(prefix: string): Promise<TimestampRecord>;
}

export class TimestampUseCase implements ITimestampUseCase {
  constructor(private readonly clockService: IClockService) {}

  async createRecord(prefix: string): Promise<TimestampRecord> {
    const normalized = prefix.trim();
    if (!normalized) {
      throw new ValidationError("O prefixo de identificação é obrigatório.");
    }
    const isoDate = this.clockService.now();
    return { label: `${normalized}:${isoDate}`, isoDate };
  }
}
```

```typescript
// 3. Infraestrutura — Adapters Concretos (src/infra/)
// O relógio do aparelho já existe: src/infra/services/system-clock-service.ts implementa IClockService.

// src/infra/database/persistence-error.ts (real)
// A Infra nunca propaga exceções nativas ou de SDK: converte para um erro puro do domínio.
import { DataSourceError, DomainError } from "@/model/errors";

/** Converte qualquer falha do driver em erro de domínio (ARCHITECTURE.md §5). */
export function toDataSourceError(error: unknown): DomainError {
  if (error instanceof DomainError) {
    return error;
  }
  return new DataSourceError();
}

// Uso em um adapter (trecho de src/infra/datasources/sqlite-task-datasource.ts, real):
//   async listAll(): Promise<Task[]> {
//     try {
//       const executor = await this.db.get();
//       const rows = await executor.all<TaskRow>(`SELECT ... FROM tasks ...`);
//       return rows.map(mapRowToTask);
//     } catch (error) {
//       throw toDataSourceError(error);
//     }
//   }
```

```typescript
// 4. Composição — Registro no Container (trechos a acrescentar em src/di/container.ts)
import { TimestampUseCase, type ITimestampUseCase } from "@/usecase/timestamp-use-case";

/** Casos de uso expostos às ViewModels. */
export type AppUseCases = {
  // ...casos de uso existentes
  timestamp: ITimestampUseCase;
};

// Dentro de appContainerDefinition.useCases({ dataSources, services }):
//   timestamp: composeUseCase(
//     ({ clock }: { clock: IClockService }) => new TimestampUseCase(clock),
//     { clock: services.clock },
//   ),
```

```typescript
// 5. ViewModel — Tipos State/Actions e Resolução de Abstração (src/viewmodel/useTimestampViewModel.ts, didático)
import { useState } from "react";
import { container, resolveUseCase } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { ITimestampUseCase } from "@/usecase/timestamp-use-case";

export type TimestampState = {
  label: string | null;
  loading: boolean;
  error: string | null;
};

export type TimestampActions = {
  handleGenerate: (prefix: string) => Promise<void>;
};

export function useTimestampViewModel(
  overrideUseCase?: ITimestampUseCase,
): [TimestampState, TimestampActions] {
  const useCase = resolveUseCase(overrideUseCase, container.useCases.timestamp);
  const [label, setLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(prefix: string): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const record = await useCase.createRecord(prefix);
      setLabel(record.label);
    } catch (err: unknown) {
      setError(
        err instanceof DomainError
          ? err.message
          : "Não foi possível concluir a operação no momento.",
      );
    } finally {
      setLoading(false);
    }
  }

  // Retorno em tupla [state, actions], como no livro (Cap. 10, Seção 10.10).
  return [{ label, loading, error }, { handleGenerate }];
}
```

```tsx
// 6. View (src/view/timestamp.tsx, didático) e Rota (src/app/timestamp.tsx)
import { Pressable, StyleSheet, Text, View } from "react-native";
import { themes } from "@/view/theme/tokens";
import { useTimestampViewModel } from "@/viewmodel/useTimestampViewModel";

const theme = themes.light;

const TimestampScreen = () => {
  const [state, actions] = useTimestampViewModel();
  const { label, loading, error } = state;
  const { handleGenerate } = actions;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.actionButton}
        onPress={() => handleGenerate("sync")}
        disabled={loading}
      >
        <Text style={styles.actionLabel}>{loading ? "Atualizando..." : "Atualizar"}</Text>
      </Pressable>
      {label ? <Text style={styles.bodyText}>{label}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default TimestampScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.space.lg, gap: theme.space.sm, backgroundColor: theme.color.surface },
  actionButton: {
    minHeight: theme.button.minHeight,
    minWidth: theme.button.minWidth,
    borderRadius: theme.button.radius,
    backgroundColor: theme.button.bg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.space.md,
  },
  actionLabel: { ...theme.font.label, color: theme.button.label },
  bodyText: { ...theme.font.body, color: theme.color["on-surface"] },
  errorText: { ...theme.font.body, color: theme.color.error },
});

// Módulo de rota no app, com o mesmo nome da tela (src/app/timestamp.tsx):
// import TimestampScreen from "../view/timestamp";
// export default TimestampScreen;
```

---

## 5. Padrão Arquitetural de Tratamento de Erros

| Camada | Responsabilidade no Tratamento de Erros |
| :--- | :--- |
| **1. Domínio (`src/model/errors.ts`)** | Define, em um único arquivo, a classe base `DomainError` e uma subclasse por tipo de falha (`ValidationError`, `DataSourceError`, `SchemaVersionError`), desacopladas de códigos HTTP, exceções de banco ou SDKs externos. O tipo da falha é a própria subclasse: os erros não carregam código nem flag de nova tentativa. |
| **2. Infraestrutura (`src/infra/`)** | Captura falhas técnicas (rede, SQLite, AsyncStorage, SDKs) em blocos `try/catch` internos e **sempre** as converte na subclasse de `src/model/errors.ts` do seu tipo (ex.: `DataSourceError` em falhas de dados, via `toDataSourceError`). **Nunca propaga erros brutos de infraestrutura.** |
| **3. Use Cases (`src/usecase/`)** | Valida parâmetros de entrada e invariantes de negócio (lançando `ValidationError` ou erros de domínio) e repassa erros de domínio originados nos contratos invocados. |
| **4. ViewModel (`src/viewmodel/`)** | Único ponto da camada de apresentação que utiliza `try/catch`. Captura erros lançados pelos Use Cases e os converte em estado reativo (`error: string \| null`, `loading: boolean`) com mensagens claras e não-punitivas (`design-system/01-principios.md`). Separa erros previstos de inesperados com `instanceof DomainError` e escolhe a mensagem pela subclasse (ex.: `instanceof SchemaVersionError`), nunca por código. |
| **5. View (`src/view/`)** | Apenas lê o estado `error` e `loading` exposto pela ViewModel para renderizar feedback visual e acessível. **Nunca utiliza `try/catch` para lógica de negócio.** |

---

## 6. Composition Root e Convenções de Injeção de Dependências (`src/di/container.ts`)

O arquivo `src/di/container.ts` materializa o **Composition Root** mínimo do Orbity sem depender de frameworks externos de injeção de dependências.

### 6.1. Responsabilidades e Regras de Composição

1. **Ponto Único de Acoplamento Concreto (`src/di/container.ts`):**
   - É o único módulo da aplicação autorizado a importar simultaneamente implementações concretas de `src/infra/` (`datasources/` e `services/`) e classes concretas de `src/usecase/`.
   - Expõe objetos imutáveis (`Object.freeze`) organizados em `dataSources`, `services` e `useCases`, além dos utilitários `composeUseCase`, `resolveUseCase`, `createContainer`, `createAppContainer` e a instância padrão `container`.
2. **Contratos de Domínio → Use Cases (`composeUseCase`):**
   - Os Use Cases em `src/usecase/` declaram suas dependências exclusivamente por meio de interfaces de `src/model/datasources/` e `src/model/services/`.
   - Nunca importam classes concretas de `src/infra/` nem o próprio `src/di/container.ts`.
3. **Abstrações de Use Cases → ViewModels (`resolveUseCase` / parâmetro padrão):**
   - As ViewModels em `src/viewmodel/` dependem exclusivamente de interfaces `I*UseCases` definidas em `src/usecase/`.
   - Recebem a abstração por parâmetro opcional (com valor padrão vindo do container ou resolvido via `resolveUseCase`), sem instanciar DataSources ou serviços diretamente.
4. **Isolamento da View (`src/view/`):**
   - Componentes e telas invocam os hooks da ViewModel sem conhecer `src/di/`, `src/usecase/` ou `src/infra/`.

### 6.2. Estratégias de Substituição por Test Doubles

A arquitetura suporta três níveis complementares de substituição de dependências em testes, sem modificar os consumidores:

- **Substituição direta no Use Case:** passar um *test double* (mock, stub, fake ou in-memory) do contrato de `src/model/` diretamente ao construtor do Use Case ou a `composeUseCase`.
- **Substituição na composição (`createContainer` / `createAppContainer`):** fornecer `overrides.dataSources` ou `overrides.services` ao criar um container isolado; os Use Cases são automaticamente recompostos com os *test doubles* fornecidos.
- **Substituição direta na ViewModel:** passar um *test double* de `I*UseCases` como argumento da ViewModel (ou via `overrides.useCases`).

### 6.3. Exemplo Técnico Mínimo de Composição e Substituição em Testes

Reutilizando `IClockService`, `ITimestampUseCase`, `TimestampUseCase` e `SystemClockService` da Seção 4.2, os três níveis de teste operam sem React Native ou infraestrutura real:

```typescript
import {
  composeUseCase,
  createContainer,
  resolveUseCase,
  type ContainerDefinition,
} from "@/di/container";
import { SystemClockService } from "@/infra/services/system-clock-service";
import { LocalDate } from "@/model/entities/local-date";
import type { IClockService } from "@/model/services/i-clock-service";
import {
  TimestampUseCase,
  type ITimestampUseCase,
} from "@/usecase/timestamp-use-case";

type ExampleDataSources = Record<string, never>;
interface ExampleServices {
  clock: IClockService;
}
interface ExampleUseCases {
  timestamp: ITimestampUseCase;
}

const definition: ContainerDefinition<
  ExampleDataSources,
  ExampleServices,
  ExampleUseCases
> = {
  dataSources: () => ({}),
  services: () => ({
    clock: new SystemClockService(),
  }),
  useCases: ({ services }) => ({
    timestamp: composeUseCase(
      (clock) => new TimestampUseCase(clock),
      services.clock,
    ),
  }),
};

const defaultContainer = createContainer(definition);

// Nível 1 — Teste unitário direto do Use Case (sem container e sem infraestrutura real)
const fakeClockService: IClockService = {
  now: () => "2026-11-04T12:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-04"),
};
const isolatedUseCase = composeUseCase(
  (clock) => new TimestampUseCase(clock),
  fakeClockService,
);
// await isolatedUseCase.createRecord("sync") -> { label: "sync:2026-11-04T12:00:00-03:00", ... }

// Nível 2 — Substituição da Infra por Test Double via Container Overrides
const testContainer = createContainer(definition, {
  services: { clock: fakeClockService },
});
// await testContainer.useCases.timestamp.createRecord("sync") usa fakeClockService

// Nível 3 — Substituição do Use Case por Test Double diretamente na ViewModel
const stubTimestampUseCase: ITimestampUseCase = {
  createRecord: async (prefix) => ({
    label: `${prefix}:stubbed`,
    isoDate: "2026-11-04T00:00:00-03:00",
  }),
};
const resolvedForViewModel = resolveUseCase(
  stubTimestampUseCase,
  defaultContainer.useCases.timestamp,
);
// await resolvedForViewModel.createRecord("ui") -> { label: "ui:stubbed", ... }
```

