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

Os arquivos de teste devem seguir o padrão `*.test.ts` (para lógica pura) ou `*.test.tsx` (para componentes React Native) e ficar no mesmo diretório do módulo testado, sem subdiretórios `__tests__/`.

```text
src/
├── view/
│   └── components/
│       ├── MainTabBar.tsx
│       ├── MainTabBar.test.tsx
│       ├── PlaceholderScreen.tsx
│       ├── PlaceholderScreen.test.tsx
│       ├── primary-button.tsx
│       └── primary-button.test.tsx
tests/
└── pure-logic.test.ts                    # Exemplo de infraestrutura sem módulo de produção associado
```

A mesma convenção se aplica aos testes de casos de uso e ViewModels: mantenha cada arquivo `*.test.ts` ao lado da implementação correspondente. Testes de telas ficam na camada `view/`, fora de `src/app/`, para não serem interpretados como rotas pelo Expo Router.

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

## 5. Execução no CI e Diagnóstico de Falhas

### 5.1. Verificações Automáticas nos Pull Requests
O workflow [`CI development`](../../.github/workflows/ci.yml) executa automaticamente o job `validate` em todos os Pull Requests direcionados à branch `development`, realizando em sequência:
1. Instalação limpa e reproduzível de dependências (`npm ci`).
2. Verificação estática de lint (`npm run lint`).
3. Verificação estrita de tipos TypeScript (`npx --no-install tsc --noEmit`).
4. Execução da suíte de testes automatizados em modo não interativo (`npm test`).

Qualquer falha de asserção, erro de execução ou problema de configuração retorna código de saída diferente de zero e interrompe imediatamente o job `validate`.

### 5.2. Reprodução Local das Validações do CI
Antes de abrir ou atualizar um Pull Request, execute localmente os mesmos comandos de verificação do workflow:

```bash
npm run lint
npx --no-install tsc --noEmit
npm test
```

### 5.3. Como Consultar Falhas nos Logs do GitHub Actions
Quando o status check `validate` falhar em um Pull Request:
1. Acesse a aba **Checks** no Pull Request (ou clique em **Details** ao lado da verificação `CI development / validate`).
2. Selecione o job **validate** no menu lateral e expanda a etapa **Executar testes**.
3. Analise o resumo do Jest indicando a suíte (`FAIL src/...`), o teste específico que falhou, a diferença entre o valor esperado (`Expected`) e o recebido (`Received`) e o *stack trace* com arquivo e linha.
4. Reproduza o erro localmente com `npx jest caminho/do/arquivo.test.ts`, aplique a correção e valide novamente com `npm test`.

---

## 6. Próximos Passos (Evolução da Qualidade)

- **T0006:** Padronização detalhada de mocks, fixtures e dados simulados para repositórios em memória, Use Cases e ViewModels.
