# Guia de Testes Automatizados, Test Doubles e Fixtures

Este documento consolida as convenções, diretrizes técnicas e padrões de qualidade para criação, organização e execução de testes automatizados no projeto **Orbity**. Ele cobre testes unitários, testes de componentes, taxonomia de *test doubles*, criação de *fixtures* e as práticas de testabilidade alinhadas à arquitetura **MVVM Sofisticado**.

---

## 1. Stack e Infraestrutura de Testes

O ambiente técnico do Orbity foi estabelecido na tarefa **T0004** e integrado ao CI na **T0005**, operando com as seguintes tecnologias:

- **Jest (~29.7.0):** Test runner, executor de asserções e orquestrador de mocks (`jest.fn()`, `jest.spyOn()`).
- **`jest-expo` (~57.0.6):** Preset oficial de configuração para React Native 0.86, Expo 57 e resolução de módulos de plataforma.
- **`@testing-library/react-native` (^14.1.0):** Utilitários de renderização assíncrona (`render`) e consulta semântica (`screen`) focados em comportamento observável e acessibilidade.
- **TypeScript (~6.0.3):** Tipagem estrita em todas as suítes, fixtures e test doubles.

A configuração central encontra-se no arquivo [`jest.config.js`](../../jest.config.js) na raiz do repositório, com `clearMocks: true` habilitado por padrão para garantir isolamento entre os testes.

---

## 2. Comandos Disponíveis

| Comando | Finalidade | Modo |
|---|---|---|
| `npm test` | Executa todas as suítes de teste de forma não interativa e encerra com código de saída (adequado para terminal local e CI). | Headless (`jest --watchAll=false`) |
| `npm run test:watch` | Executa o Jest em modo de monitoramento contínuo durante o desenvolvimento ativo. | Interativo (`jest --watch`) |
| `npx jest caminho/do/arquivo.test.ts` | Executa exclusivamente o arquivo ou suíte de teste indicado. | Headless pontual |
| `npx jest --testPathPattern=usecase` | Executa apenas os testes localizados no caminho correspondente ao padrão informado. | Filtrado por caminho |

---

## 3. Estrutura de Diretórios e Nomenclatura

Os testes automatizados no Orbity acompanham a divisão em camadas da arquitetura MVVM Sofisticado descrita em [`ARCHITECTURE.md`](../../ARCHITECTURE.md), utilizando a pasta especial `__tests__/` próxima ao código sob teste ou na raiz de testes:

```
src/
├── __tests__/
│   ├── fixtures/                             # Fixtures compartilhadas entre diferentes camadas
│   └── unit/
│       └── pure-logic.test.ts                # Testes unitários puros sem dependência de plataforma
├── infra/
│   ├── repositories/
│   │   └── __tests__/                        # Testes de adapters concretos (ex.: in-memory)
│   └── services/
│       └── __tests__/                        # Testes de serviços concretos (ex.: system clock)
├── model/
│   └── __fixtures__/                         # Fixtures de entidades puras do domínio
├── usecase/
│   └── __tests__/                            # Testes unitários puros de Use Cases
├── view/
│   ├── components/
│   │   └── __tests__/
│   │       └── primary-button.test.tsx       # Testes de componentes visuais reutilizáveis
│   └── __tests__/                            # Testes de telas (*Screen.test.tsx)
└── viewmodel/
    └── __tests__/                            # Testes de apresentação e hooks (*ViewModel.test.ts)
```

### Convenções de Nomenclatura de Arquivos
- **Lógica Pura, Use Cases e Infraestrutura:** Arquivos TypeScript em `kebab-case` sob a extensão `*.test.ts` (ex.: `timestamp-use-case.test.ts`, `system-clock-service.test.ts`).
- **ViewModels (Hooks de Apresentação):** Arquivos TypeScript em `PascalCase` sob a extensão `*ViewModel.test.ts`, espelhando o módulo `*ViewModel.ts` (ex.: `TimestampViewModel.test.ts` para testar o hook `useTimestampViewModel`).
- **Componentes e Telas React Native:** Arquivos TSX sob a extensão `*.test.tsx` (ex.: `TimestampScreen.test.tsx`, `primary-button.test.tsx`).
- **Fixtures e Fábricas de Dados:** Arquivos sob a extensão `*.fixture.ts` ou `*.factory.ts` dentro de subdiretórios `__fixtures__/` (ex.: `timestamp-record.fixture.ts`).

### Estrutura Interna das Suítes (Padrão AAA)
Toda suíte deve ser organizada através dos blocos `describe`, `it` (ou `test`) com títulos expressivos em **Português Brasileiro (`pt-BR`)**, seguindo o ciclo **AAA (Arrange, Act, Assert)**:

```typescript
describe("TimestampUseCase", () => {
  it("deve criar registro de carimbo de data/hora com formato ISO válido", async () => {
    // 1. Arrange (Preparação de entradas, dependências e fixtures)
    const fakeClockService: IClockService = {
      nowIso: async () => "2026-11-06T12:00:00.000Z",
    };
    const useCase = new TimestampUseCase(fakeClockService);

    // 2. Act (Execução da ação ou método sob teste)
    const result = await useCase.createRecord("estudo");

    // 3. Assert (Verificação do comportamento observável e dados retornados)
    expect(result.label).toBe("estudo:2026-11-06T12:00:00.000Z");
    expect(result.isoDate).toBe("2026-11-06T12:00:00.000Z");
  });
});
```

---

## 4. Taxonomia e Critérios de Escolha de Test Doubles

Test Doubles são objetos substitutos que substituem dependências reais durante a execução dos testes. No Orbity, seguimos as definições clássicas da Engenharia de Software adaptadas ao ecossistema TypeScript e Jest:

```
               ┌──────────────────────────────────────────────┐
               │                 TEST DOUBLES                 │
               └──────────────────────┬───────────────────────┘
         ┌──────────────┬─────────────┼──────────────┬─────────────┐
         ▼              ▼             ▼              ▼             ▼
     [ Dummy ]      [ Stub ]       [ Spy ]        [ Mock ]      [ Fake ]
    Parâmetro      Respostas     Monitora sem    Expectativas  Implementação
    decorativo     estáticas       alterar       comportamento   in-memory
```

### 4.1. Definições Formais

1. **Dummy:**
   - **O que é:** Objeto passado para preencher uma lista de argumentos obrigatória de um método ou construtor, mas cujos métodos ou propriedades nunca são invocados na execução daquele cenário específico.
   - **Quando usar:** Quando uma assinatura exige uma dependência secundária irrelevante para o comportamento testado.

2. **Stub:**
   - **O que é:** Objeto que fornece respostas pré-programadas e previsíveis a invocações feitas durante o teste. Não verifica chamadas nem valida se o consumidor invocou o método corretamente.
   - **Quando usar:** Para alimentar Use Cases ou ViewModels com dados controlados ou simular cenários de exceção controlada (`throw new ValidationError(...)`).

3. **Spy (`jest.spyOn`):**
   - **O que é:** Objeto que envolve um método real existente para registrar seus parâmetros de invocação, contagem de acessos e valores de retorno, preservando a lógica original (a menos que seja explicitamente combinado a `.mockImplementation()`).
   - **Quando usar:** Para verificar se um efeito colateral legítimo (como disparo de telemetria, chamadas de logging ou hooks de ciclo de vida) ocorreu sem alterar sua implementação base.

4. **Mock (`jest.fn()`):**
   - **O que é:** Objeto programado com expectativas precisas sobre como deve ser chamado. Permite inspecionar chamadas (`toHaveBeenCalledTimes`, `toHaveBeenCalledWith`).
   - **Quando usar:** Quando o sucesso do teste depende da validação de uma comunicação com outra fronteira (ex.: confirmar que uma ação do usuário disparou a notificação com os argumentos esperados).

5. **Fake (Adapters In-Memory):**
   - **O que é:** Uma implementação real, simplificada e funcional de um contrato de domínio, que mantém estado interno na memória da aplicação sem utilizar serviços externos, rede ou armazenamento em disco.
   - **Quando usar:** Para contratos de repositórios (`src/model/repositories/`) em testes de integração de Use Cases ou cenários complexos onde estados precisam persistir entre múltiplos passos.

### 4.2. Matriz de Decisão: Qual Test Double Escolher?

| Necessidade do Teste | Double Recomendado | Ferramenta Jest | Justificativa |
|---|---|---|---|
| Fornecer dados constantes ou simular falha em serviço | **Stub** | Objeto literal ou `jest.fn().mockResolvedValue(...)` | Não acopla o teste a detalhes internos de quantas vezes o método foi lido. |
| Testar fluxo complexo com persistência de estado transitório | **Fake** | Classe In-Memory (`InMemory*Repository`) | Reproduz contratos fielmente sem complexidade de infraestrutura. |
| Validar se uma função de callback ou serviço externo foi invocado com argumentos corretos | **Mock** | `jest.fn()` | O critério de aceitação do teste é a verificação comportamental de disparo. |
| Observar chamadas a utilitários de sistema ou métodos existentes sem substituir a execução | **Spy** | `jest.spyOn(objeto, "metodo")` | Garante rastreabilidade sem quebrar o comportamento original. |
| Preencher dependência não exercitada pelo teste | **Dummy** | `{}` tipado como `never` ou objeto vazio | Evita criar estruturas desnecessárias para testes unitários focados. |

### 4.3. Boas Práticas e Prevenção de "Mockitis"
- **Não teste detalhes de implementação:** Mocks excessivos tornam os testes frágeis. Se uma refatoração interna que não altera o comportamento quebrar o teste, o teste estava mal projetado.
- **Isolamento de Estado:** O Orbity possui `clearMocks: true` em seu [`jest.config.js`](../../jest.config.js). Quando criar *spies* manualmente com `jest.spyOn()`, sempre execute `jest.restoreAllMocks()` no bloco `afterEach` caso tenha substituído implementações temporárias.
- **Mocks Globais:** Nunca crie mocks de módulos globais no escopo dos arquivos a menos que afetem a plataforma Expo/React Native como um todo (e devem residir em arquivos de setup controlados).

---

## 5. Padrões e Convenções de Fixtures

*Fixtures* são conjuntos consistentes de dados de teste reutilizáveis que representam entidades do domínio, DTOs ou respostas estruturadas.

### 5.1. Diretrizes para Criação de Fixtures

1. **Padrão Factory Function:** Toda fixture deve ser fornecida através de uma função geradora (`create<Entity>Fixture`) que aceita sobrescritas parciais (`overrides?: Partial<T>`).
2. **Imutabilidade e Isolamento:** A fábrica deve sempre retornar um **novo objeto**, aplicando `Object.freeze` em entidades puras, impedindo que um teste modifique a fixture e cause falhas silenciosas ou dependência de ordem entre suítes.
3. **Minimalidade:** Forneça valores padrão realistas e semanticamente coerentes, mas inclua apenas os campos exigidos pela definição de tipos do modelo.
4. **Respeito aos Contratos Existentes:** Nunca crie fixtures para entidades ou regras de negócio fictícias de funcionalidades futuras. Use fixtures apenas para tipos formalmente aprovados e integrados.

### 5.2. Exemplo Padronizado de Fixture

```typescript
// src/model/__fixtures__/timestamp-record.fixture.ts
import type { TimestampRecord } from "@/model/entities/timestamp-record";

/**
 * Cria uma fixture imutável de TimestampRecord para utilização em testes.
 */
export function createTimestampRecordFixture(
  overrides: Partial<TimestampRecord> = {},
): TimestampRecord {
  return Object.freeze({
    label: "sync:2026-11-06T10:00:00.000Z",
    isoDate: "2026-11-06T10:00:00.000Z",
    ...overrides,
  });
}
```

---

## 6. Testabilidade no MVVM Sofisticado

A arquitetura **MVVM Sofisticado** separa rigorosamente as responsabilidades do sistema. A testabilidade de cada camada obedece a regras bem delimitadas:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. View (React Native / UI)                                            │
│    -> Testes de Componentes com RNTL (render, fireEvent, screen)       │
│    -> Sem try/catch, sem regras de negócio, foco em acessibilidade    │
├────────────────────────────────────────────────────────────────────────┤
│ 2. ViewModel (Custom Hooks de Apresentação)                           │
│    -> Testes de Hooks com renderHook                                   │
│    -> Testa reatividade (loading, error, data) e invocação de ações   │
│    -> Recebe Use Cases substituídos por Stubs/Mocks via DI             │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Use Cases (Regras de Negócio e Orquestração)                       │
│    -> Testes Unitários Puros em TypeScript (Jest puro)                 │
│    -> Sem React, sem Expo, sem dependências de UI                     │
│    -> Recebe interfaces de repositórios e serviços via construtor      │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Domínio / Model (Entidades, Tipos e Erros Puros)                   │
│    -> Testes Unitários de cálculo, validação e exceções de domínio    │
├────────────────────────────────────────────────────────────────────────┤
│ 5. Infraestrutura (Implementações Concretas e Adapters In-Memory)     │
│    -> Testes de fidelidade a contratos de persistência e serviços      │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.1. Como Testar Use Cases (`src/usecase/`)
- Os Use Cases contêm regras de negócio e validações puras.
- Devem ser testados isoladamente, instanciando diretamente a classe concreta do Use Case e passando dublês (Stubs ou Fakes) de seus contratos de domínio (`src/model/repositories/` e `src/model/services/`).
- Não utilize React, React Native Testing Library ou instâncias do container global para testes unitários de Use Cases.

### 6.2. Como Testar ViewModels (`src/viewmodel/`)
- ViewModels são implementadas em arquivos `*ViewModel.ts` (ex.: `TimestampViewModel.ts`) e expostas como Custom Hooks (`use*ViewModel`).
- Devem ser testadas utilizando o utilitário `renderHook` de `@testing-library/react-native`.
- Devem receber a interface do Use Case (`I*UseCase` / `I*UseCases`) via injeção por parâmetro opcional (resolvido internamente com `resolveUseCase` de `src/DI/container.ts`), passando um dublê da abstração.
- Verifique as transições de estado:
  - Estado inicial (dados nulos/vazios, `loading: false`, `error: null`).
  - Durante o carregamento (`loading: true`, `error: null`).
  - Sucesso (estado como `label` atualizado, `loading: false`, `error: null`).
  - Falha (captura de `DomainError` ou erro inesperado no `try/catch` da ViewModel, mensagem amigável e não-punitiva exposta em `error`, `loading: false`).

### 6.3. Como Testar a View (`src/view/` e `src/view/components/`)
- Componentes e telas React Native devem ser testados exclusivamente via `@testing-library/react-native`.
- **Renderização Assíncrona Obrigatória (React 19):** No ecossistema React 19 / RNTL 14, utilize sempre `await render(<Componente />)` em funções de teste assíncronas.
- **Foco em Acessibilidade e Semântica:** Busque elementos preferencialmente por papéis (`screen.getByRole("button")`), rótulos de acessibilidade (`screen.getByLabelText(...)`) ou texto visível (`screen.getByText(...)`).
- **Interações:** Use `fireEvent.press(...)` para simular cliques e eventos.
- **Isolamento Completo:** A View não deve executar regras de negócio nem conter blocos `try/catch`. O teste de componente deve validar se a UI reflete fielmente o estado (`label`, `loading`, `error`) provido pela ViewModel.

### 6.4. Como Testar a Infraestrutura e Adapters Concretos (`src/infra/`)
- Serviços (`src/infra/services/`) e repositórios (`src/infra/repositories/`) concretos devem ser criados e testados somente quando existir um contrato real previamente definido em `src/model/services/` ou `src/model/repositories/`.
- Conforme a **Regra de Ouro da Infraestrutura** em [`ARCHITECTURE.md`](../../ARCHITECTURE.md), os testes de infraestrutura devem validar tanto o mapeamento para entidades puras de `src/model/entities/` quanto a conversão de falhas técnicas/nativas para instâncias de `DomainError` (`src/model/errors/`), garantindo que exceções brutas nunca vazem para as camadas superiores.

### 6.5. Inversão de Dependências e Composition Root (`src/DI/container.ts`)
Conforme documentado em [`ARCHITECTURE.md`](../../ARCHITECTURE.md), a aplicação provê três níveis de substituição de dependências:

1. **Nível 1 (Unitário Direto no Use Case):** Passar o dublê diretamente ao construtor do Use Case ou a `composeUseCase((clock) => new TimestampUseCase(clock), fakeClockService)`.
2. **Nível 2 (Composição com Container Overrides):** Utilizar `createContainer(definition, { services: { clock: fakeClockService } })` ou `createAppContainer(...)` para recompor automaticamente os Use Cases integrados.
3. **Nível 3 (ViewModel Direta):** Passar um dublê do Use Case (`I*UseCase` / `I*UseCases`) diretamente como argumento de `use*ViewModel(stubUseCase)` ou resolver via `resolveUseCase(stubUseCase, defaultContainer.useCases.timestamp)`.

---

## 7. Boas Práticas, Determinismo e Isolamento

Para garantir que os testes do Orbity executem de forma reproduzível tanto localmente quanto no GitHub Actions (CI):

1. **Determinismo Temporal com Fake Timers:**
   - Nunca confie no relógio do sistema operacional para testes que dependem de passagem de tempo, intervalos ou debounce.
   - Utilize as funções de controle de tempo do Jest:
     ```typescript
     beforeEach(() => {
       jest.useFakeTimers();
     });

     afterEach(() => {
       jest.runOnlyPendingTimers();
       jest.useRealTimers();
     });
     ```
   - Avance o tempo de forma controlada com `jest.advanceTimersByTime(ms)`.

2. **Tratamento de Assincronia e Reatividade:**
   - Para operações assíncronas em hooks ou componentes, aguarde a resolução de promessas com `await waitFor(() => expect(...).toBe(...))` provido pelo Testing Library.
   - Nunca utilize `setTimeout` arbitrário em testes assíncronos.

3. **Sem Estado Compartilhado:**
   - Cada teste deve criar suas próprias instâncias de variáveis, dublês e fixtures.
   - Evite declarar objetos mutáveis reutilizados entre diferentes blocos `it`.

4. **Asserções Voltadas ao Comportamento Observável:**
   - Teste **o que** o código produz (resultados, estados, saídas na tela e acessibilidade), e não **como** ele opera internamente.
   - Não faça asserções sobre propriedades privadas ou chamadas a métodos auxiliares não declarados em contratos públicos.

---

## 8. Exemplos Práticos por Camada (Base Didática)

Os exemplos a seguir utilizam as abstrações didáticas de carimbo de data/hora consolidadas em [`ARCHITECTURE.md`](../../ARCHITECTURE.md) (`IClockService`, `TimestampUseCase`, `useTimestampViewModel` e `TimestampScreen`), além de componentes existentes como `PrimaryButton`, garantindo total compatibilidade sem inventar regras fictícias para épicos futuros.

### 8.1. Exemplo: Teste Unitário de Use Case com Stub de Serviço

```typescript
// src/usecase/__tests__/timestamp-use-case.test.ts
import { ValidationError } from "@/model/errors/domain-error";
import type { IClockService } from "@/model/services/clock-service";
import { TimestampUseCase } from "@/usecase/timestamp-use-case";

describe("TimestampUseCase", () => {
  it("deve criar registro de carimbo de data/hora delegando ao servico de relogio", async () => {
    // Stub do contrato IClockService fornecendo resposta predeterminada
    const stubClockService: IClockService = {
      nowIso: async () => "2026-11-06T10:00:00.000Z",
    };

    const useCase = new TimestampUseCase(stubClockService);
    const record = await useCase.createRecord("estudo-diario");

    expect(record.label).toBe("estudo-diario:2026-11-06T10:00:00.000Z");
    expect(record.isoDate).toBe("2026-11-06T10:00:00.000Z");
  });

  it("deve lancar ValidationError quando o prefixo estiver vazio ou em branco", async () => {
    const dummyClockService: IClockService = {
      nowIso: async () => "2026-11-06T10:00:00.000Z",
    };

    const useCase = new TimestampUseCase(dummyClockService);

    await expect(useCase.createRecord("   ")).rejects.toThrow(ValidationError);
  });
});
```

### 8.2. Exemplo: Teste de Hook de ViewModel com Dublê de Use Case

```typescript
// src/viewmodel/__tests__/TimestampViewModel.test.ts
import { renderHook, act } from "@testing-library/react-native";
import { ValidationError } from "@/model/errors/domain-error";
import type { ITimestampUseCase } from "@/usecase/timestamp-use-case";
import { useTimestampViewModel } from "@/viewmodel/TimestampViewModel";

describe("useTimestampViewModel", () => {
  it("deve gerenciar estado de loading e atualizar label com sucesso", async () => {
    const stubUseCase: ITimestampUseCase = {
      createRecord: jest.fn().mockResolvedValue({
        label: "sync:2026-11-06T10:00:00.000Z",
        isoDate: "2026-11-06T10:00:00.000Z",
      }),
    };

    const { result } = renderHook(() => useTimestampViewModel(stubUseCase));

    expect(result.current.loading).toBe(false);
    expect(result.current.label).toBeNull();
    expect(result.current.error).toBeNull();

    await act(async () => {
      await result.current.handleGenerate("sync");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.label).toBe("sync:2026-11-06T10:00:00.000Z");
    expect(result.current.error).toBeNull();
    expect(stubUseCase.createRecord).toHaveBeenCalledWith("sync");
  });

  it("deve capturar DomainError do Use Case e expor mensagem no estado error", async () => {
    const failingUseCase: ITimestampUseCase = {
      createRecord: jest
        .fn()
        .mockRejectedValue(
          new ValidationError("O prefixo de identificação é obrigatório."),
        ),
    };

    const { result } = renderHook(() => useTimestampViewModel(failingUseCase));

    await act(async () => {
      await result.current.handleGenerate("   ");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.label).toBeNull();
    expect(result.current.error).toBe(
      "O prefixo de identificação é obrigatório.",
    );
  });
});
```

### 8.3. Exemplo: Teste de Componente Visual com Testing Library

```typescript
// src/view/components/__tests__/primary-button.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { PrimaryButton } from "@/view/components/primary-button";

describe("PrimaryButton", () => {
  it("renderiza o rotulo do botao corretamente de forma assincrona", async () => {
    await render(<PrimaryButton label="Concluir" onPress={() => {}} />);
    expect(screen.getByText("Concluir")).toBeTruthy();
  });

  it("dispara evento onPress quando acionado pelo usuario", async () => {
    const onPressMock = jest.fn();
    await render(<PrimaryButton label="Salvar" onPress={onPressMock} />);

    fireEvent.press(screen.getByText("Salvar"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("garante atributos semanticos no estado desabilitado", async () => {
    await render(<PrimaryButton label="Bloqueado" onPress={() => {}} disabled />);
    const button = screen.getByRole("button");
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
```

---

## 9. Execução no CI e Diagnóstico de Falhas

### 9.1. Verificações Automáticas nos Pull Requests
O workflow [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) executa automaticamente em todos os Pull Requests direcionados à `development`:
1. Instalação determinística de dependências (`npm ci`).
2. Verificação estática de formatação e lint (`npm run lint`).
3. Verificação rigorosa do compilador TypeScript (`npx --no-install tsc --noEmit`).
4. Execução completa da suíte de testes automatizados (`npm test`).

### 9.2. Checklist Local Pré-Commit e Pré-PR
Sempre execute localmente a sequência completa de validações antes de abrir ou atualizar seu Pull Request:

```bash
npm run lint
npx --no-install tsc --noEmit
npm test
node scripts/verify-local-hooks.mjs
```

### 9.3. Como Investigar Falhas nos Logs do CI
Caso o status check `validate` falhe no GitHub Actions:
1. Abra a aba **Actions** ou **Checks** no Pull Request e clique no job `validate`.
2. Expanda a seção **Executar testes**.
3. O Jest reportará explicitamente a suíte com falha (`FAIL`), o cenário específico (`✕`), a divergência entre o valor esperado (`Expected`) e o recebido (`Received`), e o rastreamento de pilha (*stack trace*) apontando para a linha exata.
4. Reproduza localmente executando `npx jest caminho/do/arquivo.test.ts`, aplique as alterações necessárias e valide novamente com `npm test`.
