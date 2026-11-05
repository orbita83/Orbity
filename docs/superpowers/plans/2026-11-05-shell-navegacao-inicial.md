# Shell navegável inicial — plano de implementação

> **For agentic workers:** Este plano foi executado nesta sessão. Passos usam caixas marcadas para acompanhamento.

**Goal:** Entregar as cinco telas provisórias da issue #83 com navegação inferior compartilhada e acessível.

**Architecture:** `src/app/_layout.tsx` registra um navegador `Tabs` e delega sua barra para um componente da View. Cada módulo de rota reexporta uma tela da View. O estado ativo vem do roteador, sem ViewModel ou domínio fictício.

**Tech Stack:** React Native 0.86, Expo Router 57, TypeScript, Jest e React Native Testing Library.

**Spec:** [Issue #83](https://github.com/orbita83/Orbity/issues/83), `ARCHITECTURE.md`, `RULES.md` e `design-system/04-componentes/navbar.md`.

## Global Constraints

- Identificadores em `src/` em inglês; mensagens de interface e documentação em pt-BR.
- Arquivos de rota em kebab-case; telas e componentes de View em PascalCase.
- Usar apenas tokens oficiais de cor, tipografia, espaçamento e raio.
- Preservar o contrato público existente de `NavBar` e as cinco abas na ordem especificada.
- Nenhuma funcionalidade de tarefas, rotinas, Cosmos ou perfil nesta entrega.

## Review Focus

- Entrada em `/`: Início precisa aparecer como aba selecionada.
- Troca repetida de aba: a seleção deve seguir o índice do navegador, sem estado paralelo.
- Toque na aba atual: não deve empilhar outra rota.
- Área segura inferior: a barra deve terminar acima da navegação do sistema.
- Texto ampliado: rótulos e conteúdo devem permanecer acessíveis sem corte rígido.

---

### Task 1: Navegação compartilhada

**Files:**
- Modify: `src/app/_layout.tsx`
- Create: `src/view/components/MainTabBar.tsx`
- Modify: `src/view/components/nav-bar.tsx`
- Test: `src/view/components/__tests__/MainTabBar.test.tsx`

**Interfaces:**
- Consumes: `NavBar({ activeTab, onSelectTab, theme })` e estado do `Tabs`.
- Produces: `MainTabBar(props: BottomTabBarProps)`, com cinco IDs ligados a `index`, `tasks`, `routines`, `cosmos` e `profile`.

- [x] Testar aba ativa, toque em outro destino e toque na aba atual.
- [x] Implementar `Tabs` e a barra compartilhada com `useSafeAreaInsets` e `themes.cosmic`.
- [x] Ajustar a `NavBar` para usar tokens existentes nas medidas visuais que esta integração utiliza.
- [x] Executar o teste para confirmar aprovação.

### Task 2: Cinco telas provisórias

**Files:**
- Create: `src/view/components/PlaceholderScreen.tsx`
- Create: `src/view/HomeScreen.tsx`, `TasksScreen.tsx`, `RoutinesScreen.tsx`, `CosmosScreen.tsx`, `ProfileScreen.tsx`
- Modify: `src/app/index.tsx`
- Create: `src/app/tasks.tsx`, `routines.tsx`, `cosmos.tsx`, `profile.tsx`
- Test: `src/view/components/__tests__/PlaceholderScreen.test.tsx`

**Interfaces:**
- Consumes: `themes.cosmic`.
- Produces: cinco telas default; `PlaceholderScreen({ title, message })` com cabeçalho e mensagem acessível.

- [x] Testar renderização de título e mensagem acessíveis.
- [x] Implementar as telas e reexportações de rota, com texto provisório sem dados fictícios.
- [x] Executar o teste para confirmar aprovação.

### Task 3: Documentação e verificação

**Files:**
- Create: `docs/shell-navegacao-inicial.md`

- [x] Documentar mapeamento das rotas, substituição futura dos estados e tokens/componentes usados.
- [x] Executar `npm run lint`, `npx --no-install tsc --noEmit` e `npm test`.
- [x] Verificar disponibilidade de Android e registrar evidências ou limite do ambiente.
- [x] Revisar o diff e o estado da branch.
