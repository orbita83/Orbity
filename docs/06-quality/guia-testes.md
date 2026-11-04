# Guia de Testes Automatizados

Este documento descreve a infraestrutura, convenções e comandos para execução e criação de testes automatizados no projeto **Orbity**, estabelecida na tarefa **T0004**.

---

## 1. Stack e Infraestrutura de Testes

O ambiente de testes do Orbity utiliza:
- **Jest (~29.7.0):** Test runner e framework de asserções.
- **`jest-expo` (~57.0.6):** Preset oficial para compatibilidade com Expo 57, React Native 0.86 e módulos do ecossistema.
- **`@testing-library/react-native` (^14.1.0):** Utilitários de renderização e consulta orientados à acessibilidade para React 19 / React Native.
- **TypeScript (~6.0.3):** Tipagem estrita em todas as suítes de teste.

A configuração central fica no arquivo [`jest.config.js`](../../jest.config.js) na raiz do projeto.

---

## 2. Comandos Disponíveis

| Comando | Finalidade |
|---|---|
| `npm test` | Executa todas as suítes de teste em modo único (headless / CI-ready), sem prender o terminal (`jest --watchAll=false`). |
| `npm run test:watch` | Executa os testes em modo interativo de monitoramento contínuo durante o desenvolvimento (`jest --watch`). |
| `npx jest caminho/do/arquivo.test.ts` | Executa pontualmente uma suíte específica de testes. |

---

## 3. Estrutura de Pastas e Convenções

Os arquivos de teste devem seguir o padrão `*.test.ts` (para lógica pura) ou `*.test.tsx` (para componentes React Native) e ser alocados em subdiretórios `__tests__/`:

```
src/
├── __tests__/
│   └── unit/
│       └── pure-logic.test.ts            # Testes unitários puros sem dependência de UI
├── view/
│   └── components/
│       ├── primary-button.tsx
│       └── __tests__/
│           └── primary-button.test.tsx   # Smoke tests e testes de acessibilidade de UI
├── usecase/
│   └── __tests__/                        # (Futuro T0006) Testes de regras de negócio
└── viewmodel/
    └── __tests__/                        # (Futuro T0006) Testes de hooks de apresentação
```

---

## 4. Diretrizes para Novos Testes

### 4.1. Testes Unitários de Lógica Pura
- Devem testar funções de domínio, cálculos, validadores e utilitários sem instanciar elementos visuais ou módulos nativos de plataforma.
- Podem ser síncronos ou assíncronos conforme a natureza da função testada.
- Devem utilizar asserções expressivas do Jest (`toBe`, `toEqual`, `toThrow`).

### 4.2. Testes de Componentes com Testing Library
- **Renderização Assíncrona (React 19 / RNTL 14):** A função `render` opera de maneira assíncrona; utilize sempre `await render(<Componente />)` dentro da função de teste declarada como `async`.
- **Foco em Acessibilidade:** Priorize seletores semânticos e papéis de acessibilidade (`screen.getByRole`, `screen.getByLabelText`, `screen.getByText`).
- **Disparo de Eventos:** Utilize `fireEvent.press` para simular interações do usuário.
- **Isolamento:** Os testes executam em ambiente simulado Node/Jest, sem necessidade de emuladores, navegadores ou dispositivos físicos conectados.

---

## 5. Próximos Passos (Evolução da Qualidade)

- **T0005:** Integração da execução do comando `npm test` no fluxo de Integração Contínua (CI) do GitHub Actions.
- **T0006:** Padronização detalhada de mocks, fixtures e dados simulados para repositórios em memória, Use Cases e ViewModels.
