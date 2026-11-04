##@ARCHITECTURE

# Guia Completo: MVVM Sofisticado (Capítulo 10)

> **Fonte:** *Tutoriais de PDM: Desenvolvimento Mobile com React Native e Expo*  
> **Capítulo 10:** *MVVM Sofisticado com React Native, TypeScript e Expo* (pp. 127–143)

---

## 1. Visão Geral e Evolução

O **MVVM Sofisticado** evolui o padrão simplificado (vista no Capítulo 8) incorporando princípios fundamentais da Engenharia de Software, como **Clean Architecture**, **Inversão de Dependências (DIP)** e **Testabilidade Unitária**.

### Diferenças Principais: MVVM Simplificado vs. Sofisticado

| Aspecto | MVVM Simplificado (Cap. 8) | MVVM Sofisticado (Cap. 10) |
| :--- | :--- | :--- |
| **ViewModel** | Concentra estado da tela + chamadas diretas a serviços. | Gerencia **apenas o estado da tela**; delega toda lógica aos *Use Cases*. |
| **Regras de Negócio** | Misturadas na ViewModel ou no Serviço. | Isoladas exclusivamente na camada de **Use Cases**. |
| **Model** | Continha entidades e serviços concretos. | Contém **apenas entidades puras e interfaces (contratos)**. |
| **Acesso a Dados** | Direto nos serviços/repositórios dentro do Model. | Isolado na camada de **Infraestrutura** (*Firebase, SQLite, REST, Memory*). |
| **Dependências** | Classes concretas importadas diretamente. | **Inversão de Dependência (DIP)** via interfaces e Container de Injeção (*DI*). |

---

## 2. As 5 Camadas do MVVM Sofisticado

```
View  -->  ViewModel  -->  Use Cases  -->  Domínio (Model)  <--  Infraestrutura
```

1. **View (Interface):** Componentes e telas React Native. Responsável apenas por renderizar estado e disparar ações (*fire-and-forget*). Não possui blocos `try/catch` nem regras de negócio.
2. **ViewModel (Apresentação):** Custom Hooks que gerenciam estado de interface (`loading`, `error`, `data`) e expõem funções de ação. Depende **apenas de abstrações** (interfaces de Use Cases).
3. **Use Cases (Casos de Uso / Orquestração):** Contratos (`I*UseCase` / `I*UseCases`) e implementações de regras de negócio puras e validações do sistema. Orquestram repositórios e serviços exclusivamente através de interfaces do domínio.
4. **Domínio / Model (Core do Negócio):** Entidades puras (`src/model/entities/`), erros de domínio (`src/model/errors/`), interfaces de repositórios (`src/model/repositories/`) e interfaces de serviços (`src/model/services/`). **Zero dependência de bibliotecas externas** (React, Expo, SDKs).
5. **Infraestrutura:**
   Implementa:
   - **Services concretos** (`src/infra/services/`, ex.: adapters de relógio, notificações ou APIs);
   - **Repositórios / DataSources concretos** (`src/infra/repositories/`, ex.: implementações em memória ou armazenamento local);
   - **Mapeamentos** para converter dados externos em entidades do domínio.

   > **Regra de Ouro da Infraestrutura:** A Infra nunca propaga erros específicos. Sempre converte para erros puros definidos no domínio.

   > **Nota — DataSource, Service e Use Case:**
   > - **DataSource / Repository (Infra):** Lida com persistência e busca de dados brutos (memória, banco local, Firestore, API) e os mapeia para entidades do domínio.
   > - **Service (Infra):** Lida com integrações e capacidades externas (autenticação, notificações, sensores, câmera).
   > - **Use Case:** Coordena e aplica as regras de negócio sobre as interfaces de `Service` e `Repository`/`DataSource`, sem saber qual tecnologia concreta está por baixo.

---

## 3. Estrutura de Pastas Materializada

```
└── src/
    ├── app/                  # Módulos de rota do Expo Router (kebab-case.tsx)
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── infra/                # Implementações concretas (Infraestrutura)
    │   ├── repositories/     # Repositórios / DataSources concretos (ex.: Memory, SQLite, Firestore)
    │   └── services/         # Serviços concretos de integração externa
    ├── model/                # Camada de Domínio Puro (zero dependências externas)
    │   ├── entities/         # Entidades e tipos puros de domínio
    │   ├── errors/           # Erros puros de domínio (ex.: ValidationError)
    │   ├── repositories/     # Contratos (interfaces) de repositórios / DataSources
    │   └── services/         # Contratos (interfaces) de serviços externos
    ├── usecase/              # Casos de Uso (contratos I*UseCases e implementações)
    ├── view/                 # Componentes de tela (*-screen.tsx) e UI
    │   ├── components/       # Componentes reutilizáveis de interface
    │   └── theme/            # Tokens visuais e temas do Design System
    ├── viewmodel/            # Custom Hooks de estado e apresentação (use*ViewModel.ts)
    └── DI/                   # Ponto de composição e Injeção de Dependências
        └── container.ts      # Composition Root mínimo e fábricas de composição
```

### 3.1. Limites Arquiteturais e Regras de Dependência

O alias `@/*` aponta para `./src/*` (`tsconfig.json`).

| Camada (`src/`) | Responsabilidade e Limite Estrito | Dependências Permitidas | Dependências Proibidas |
| :--- | :--- | :--- | :--- |
| **`app/`** | Módulos de rota do Expo Router. Apenas importam e re-exportam como `default` as telas de `src/view/`. | `src/view/`, `expo-router` | `viewmodel/`, `usecase/`, `model/`, `infra/`, `DI/` |
| **`view/`** | Componentes visuais (`components/`), telas (`*-screen.tsx`) e tokens (`theme/`). Renderiza estado e dispara ações sem `try/catch` ou regras. | `src/viewmodel/`, `src/view/`, React Native, tokens do Design System | `usecase/`, `model/` (regras/serviços), `infra/`, `DI/` |
| **`viewmodel/`** | Custom Hooks (`use*ViewModel`) que gerenciam estado de UI (`loading`, `error`, dados) e orquestram chamadas aos contratos de Use Cases. | Contratos `I*UseCases` (`src/usecase/`), `src/model/entities/`, `src/DI/container.ts`, React hooks | Classes concretas de `usecase/`, `model/repositories/`, `model/services/`, `infra/` |
| **`usecase/`** | Contratos (`I*UseCases`) e implementações (`*UseCases`) de regras de negócio e validações. Recebem dependências via construtor. | `src/model/` (`entities/`, `errors/`, `repositories/`, `services/`) | `app/`, `view/`, `viewmodel/`, `infra/`, `DI/`, React Native, Expo, SDKs externos |
| **`model/`** | Núcleo de domínio puro: entidades (`entities/`), erros (`errors/`) e contratos (`repositories/`, `services/`). | Apenas módulos internos do próprio `src/model/` | Qualquer outra camada (`app`, `view`, `viewmodel`, `usecase`, `infra`, `DI`) ou biblioteca externa |
| **`infra/`** | Repositórios/DataSources (`repositories/`) e serviços (`services/`) concretos, adapters e mapeadores de dados externos para o domínio. | Contratos, entidades e erros de `src/model/`, SDKs/APIs externas | `app/`, `view/`, `viewmodel/`, `usecase/`, `DI/` |
| **`DI/`** | Composition Root (`container.ts`). Único ponto autorizado a instanciar e conectar `infra/` e `usecase/`. | `src/infra/`, `src/usecase/`, `src/model/` | `app/`, `view/`, `viewmodel/` |

---

## 4. Contratos, Inversão de Dependências (DIP) e Adapters

### 4.1. Convenções de Contratos e Implementações

1. **Contratos de Domínio (`src/model/repositories/` e `src/model/services/`):**
   - Definem interfaces puras prefixadas com `I` (`IClockService`, `IRepository`), operando apenas com tipos primitivos, entidades de `src/model/entities/` e erros de `src/model/errors/`.
   - Não expõem DTOs externos, tipos de banco de dados, objetos HTTP ou detalhes de bibliotecas.
2. **Contratos e Orquestração de Use Cases (`src/usecase/`):**
   - Cada caso de uso expõe uma interface pública (`I*UseCases` ou `I*UseCase`) consumida pela ViewModel e uma classe concreta (`*UseCases` ou `*UseCase`) que depende exclusivamente das interfaces de `src/model/` injetadas via construtor.
3. **Repositórios, Services e Adapters na Infraestrutura (`src/infra/`):**
   - Classes em `src/infra/repositories/` e `src/infra/services/` atuam como **adapters**: implementam explicitamente (`implements`) as interfaces de `src/model/`, convertem estruturas brutas externas (JSON, linhas SQLite, SDKs) em entidades puras de `src/model/entities/` e traduzem falhas técnicas em erros de `src/model/errors/`.

### 4.2. Fluxo entre Camadas (Exemplo Técnico Neutro)

Os trechos abaixo ilustram a comunicação ponta a ponta entre as camadas respeitando o mecanismo de composição de `src/DI/container.ts`, sem antecipar regras de negócio de produto:

```typescript
// 1. Domínio Puro — Entidade, Erro e Contrato (src/model/)
// src/model/entities/timestamp-record.ts
export interface TimestampRecord {
  readonly label: string;
  readonly isoDate: string;
}

// src/model/errors/domain-error.ts
export class DomainError extends Error {
  constructor(message: string, readonly code: string = "DOMAIN_ERROR") {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

// src/model/services/clock-service.ts
export interface IClockService {
  nowIso(): Promise<string>;
}
```

```typescript
// 2. Caso de Uso — Contrato e Implementação (src/usecase/timestamp-use-case.ts)
import type { TimestampRecord } from "@/model/entities/timestamp-record";
import { ValidationError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/clock-service";

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
    const isoDate = await this.clockService.nowIso();
    return { label: `${normalized}:${isoDate}`, isoDate };
  }
}
```

```typescript
// 3. Infraestrutura — Adapter Concreto (src/infra/services/system-clock-service.ts)
import { DomainError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/clock-service";

export class SystemClockService implements IClockService {
  async nowIso(): Promise<string> {
    try {
      return new Date().toISOString();
    } catch {
      // A Infra nunca propaga exceções nativas/SDK; converte para erro puro do domínio
      throw new DomainError("Não foi possível consultar o relógio do dispositivo.", "CLOCK_FAILURE");
    }
  }
}
```

```typescript
// 4. ViewModel — Tipos State/Actions e Resolução de Abstração (src/viewmodel/use-timestamp-view-model.ts)
import { useState } from "react";
import { resolveUseCase } from "@/DI/container";
import { DomainError } from "@/model/errors/domain-error";
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
): TimestampState & TimestampActions {
  const useCase = resolveUseCase(
    overrideUseCase,
    defaultContainer.useCases.timestamp,
  );
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

  return { {label, loading, error }, { handleGenerate } };
}
```

```tsx
// 5. View (src/view/timestamp-screen.tsx) e Rota (src/app/timestamp-screen.tsx)
import { Pressable, StyleSheet, Text, View } from "react-native";
import { themes } from "@/view/theme/tokens";
import {
  useTimestampViewModel,
  type TimestampActions,
  type TimestampState,
} from "@/viewmodel/use-timestamp-view-model";

const theme = themes.light;

const TimestampScreen = () => {
  const { label, loading, error, handleGenerate }: TimestampState & TimestampActions =
    useTimestampViewModel();

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

// Módulo de Rota no App (src/app/timestamp-screen.tsx):
// import TimestampScreen from "@/view/timestamp-screen";
// export default TimestampScreen;
```

---

## 5. Padrão Arquitetural de Tratamento de Erros

| Camada | Responsabilidade no Tratamento de Erros |
| :--- | :--- |
| **1. Domínio (`src/model/errors/`)** | Define classes puras de erro (`DomainError`, `ValidationError`) desacopladas de códigos HTTP, exceções de banco ou SDKs externos. |
| **2. Infraestrutura (`src/infra/`)** | Captura falhas técnicas (rede, SQLite, AsyncStorage, SDKs) em blocos `try/catch` internos e **sempre** as converte em instâncias de `src/model/errors/`. **Nunca propaga erros brutos de infraestrutura.** |
| **3. Use Cases (`src/usecase/`)** | Valida parâmetros de entrada e invariantes de negócio (lançando `ValidationError` ou erros de domínio) e repassa erros de domínio originados nos contratos invocados. |
| **4. ViewModel (`src/viewmodel/`)** | Único ponto da camada de apresentação que utiliza `try/catch`. Captura erros lançados pelos Use Cases e os converte em estado reativo (`error: string \| null`, `loading: boolean`) com mensagens claras e não-punitivas (`design-system/01-principios.md`). |
| **5. View (`src/view/`)** | Apenas lê o estado `error` e `loading` exposto pela ViewModel para renderizar feedback visual e acessível. **Nunca utiliza `try/catch` para lógica de negócio.** |

---

## 6. Composition Root e Convenções de Injeção de Dependências (`src/DI/container.ts`)

O arquivo `src/DI/container.ts` materializa o **Composition Root** mínimo do Orbity sem depender de frameworks externos de injeção de dependências.

### 6.1. Responsabilidades e Regras de Composição

1. **Ponto Único de Acoplamento Concreto (`src/DI/container.ts`):**
   - É o único módulo da aplicação autorizado a importar simultaneamente implementações concretas de `src/infra/` (`repositories/` e `services/`) e classes concretas de `src/usecase/`.
   - Expõe objetos imutáveis (`Object.freeze`) organizados em `repositories`, `services` e `useCases`, além dos utilitários `composeUseCase`, `resolveUseCase`, `createContainer`, `createAppContainer` e a instância padrão `container`.
2. **Contratos de Domínio → Use Cases (`composeUseCase`):**
   - Os Use Cases em `src/usecase/` declaram suas dependências exclusivamente por meio de interfaces de `src/model/repositories/` e `src/model/services/`.
   - Nunca importam classes concretas de `src/infra/` nem o próprio `src/DI/container.ts`.
3. **Abstrações de Use Cases → ViewModels (`resolveUseCase` / parâmetro padrão):**
   - As ViewModels em `src/viewmodel/` dependem exclusivamente de interfaces `I*UseCases` definidas em `src/usecase/`.
   - Recebem a abstração por parâmetro opcional (com valor padrão vindo do container ou resolvido via `resolveUseCase`), sem instanciar repositórios ou serviços diretamente.
4. **Isolamento da View (`src/view/`):**
   - Componentes e telas invocam os hooks da ViewModel sem conhecer `src/DI/`, `src/usecase/` ou `src/infra/`.

### 6.2. Estratégias de Substituição por Test Doubles

A arquitetura suporta três níveis complementares de substituição de dependências em testes, sem modificar os consumidores:

- **Substituição direta no Use Case:** passar um *test double* (mock, stub, fake ou in-memory) do contrato de `src/model/` diretamente ao construtor do Use Case ou a `composeUseCase`.
- **Substituição na composição (`createContainer` / `createAppContainer`):** fornecer `overrides.repositories` ou `overrides.services` ao criar um container isolado; os Use Cases são automaticamente recompostos com os *test doubles* fornecidos.
- **Substituição direta na ViewModel:** passar um *test double* de `I*UseCases` como argumento da ViewModel (ou via `overrides.useCases`).

### 6.3. Exemplo Técnico Mínimo de Composição e Substituição em Testes

Reutilizando `IClockService`, `ITimestampUseCase`, `TimestampUseCase` e `SystemClockService` da Seção 4.2, os três níveis de teste operam sem React Native ou infraestrutura real:

```typescript
import {
  composeUseCase,
  createContainer,
  resolveUseCase,
  type ContainerDefinition,
} from "@/DI/container";
import { SystemClockService } from "@/infra/services/system-clock-service";
import type { IClockService } from "@/model/services/clock-service";
import {
  TimestampUseCase,
  type ITimestampUseCase,
} from "@/usecase/timestamp-use-case";

type ExampleRepositories = Record<string, never>;
interface ExampleServices {
  clock: IClockService;
}
interface ExampleUseCases {
  timestamp: ITimestampUseCase;
}

const definition: ContainerDefinition<
  ExampleRepositories,
  ExampleServices,
  ExampleUseCases
> = {
  repositories: () => ({}),
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
  nowIso: async () => "2026-11-04T12:00:00.000Z",
};
const isolatedUseCase = composeUseCase(
  (clock) => new TimestampUseCase(clock),
  fakeClockService,
);
// await isolatedUseCase.createRecord("sync") -> { label: "sync:2026-11-04T12:00:00.000Z", ... }

// Nível 2 — Substituição da Infra por Test Double via Container Overrides
const testContainer = createContainer(definition, {
  services: { clock: fakeClockService },
});
// await testContainer.useCases.timestamp.createRecord("sync") usa fakeClockService

// Nível 3 — Substituição do Use Case por Test Double diretamente na ViewModel
const stubTimestampUseCase: ITimestampUseCase = {
  createRecord: async (prefix) => ({
    label: `${prefix}:stubbed`,
    isoDate: "2026-11-04T00:00:00.000Z",
  }),
};
const resolvedForViewModel = resolveUseCase(
  stubTimestampUseCase,
  defaultContainer.useCases.timestamp,
);
// await resolvedForViewModel.createRecord("ui") -> { label: "ui:stubbed", ... }
```

