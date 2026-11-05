# Shell navegável inicial (T0017)

O layout `src/app/_layout.tsx` registra os cinco destinos em `Tabs` do Expo Router. O componente `src/view/components/MainTabBar.tsx` conecta o estado do navegador à `NavBar` existente; a aba selecionada vem diretamente de `state.index`. O mesmo componente reserva a área segura inferior. O retorno do Android usa `backBehavior="firstRoute"` para voltar à tela Início.

| Destino | Módulo de rota (`src/app/`) | Tela (`src/view/`) |
| --- | --- | --- |
| Início | `index.tsx` | `HomeScreen.tsx` |
| Tarefas | `tasks.tsx` | `TasksScreen.tsx` |
| Rotinas | `routines.tsx` | `RoutinesScreen.tsx` |
| Cosmos | `cosmos.tsx` | `CosmosScreen.tsx` |
| Perfil | `profile.tsx` | `ProfileScreen.tsx` |

Cada tela usa `PlaceholderScreen` para apresentar título e mensagem provisória. Os próximos épicos podem substituir o conteúdo de cada tela da View sem modificar os módulos de rota ou a barra compartilhada. Não há dados, ViewModels ou contratos de negócio simulados.

## Design System

- Componente: `NavBar` (`design-system/04-componentes/navbar.md`), com ícones e rótulos de F1/F2 na ordem oficial.
- Tema: `themes.cosmic`, escolhido explicitamente para os cinco destinos.
- Tokens: `color.surface`, `color.on-surface`, `color.on-surface-variant`, `font.title`, `font.body`, `font.label`, `space.sm`, `space.md`, `target.min-size`, `navbar.*` e tokens de foco.
- A seleção é indicada pelo rótulo em destaque, ícone preenchido, cápsula visual e `accessibilityState.selected`.

## Validação

Os testes automatizados cobrem título e mensagem provisória, seleção da aba conforme a rota, acionamento de outro destino, toque na aba atual e cancelamento do evento `tabPress`.

Em 05/11/2026, o shell foi executado com Expo Go no emulador `Medium_Phone_API_36.1`, Android 16, resolução 1080 × 2400 px e densidade 420 dpi, na branch `chore/shell-navegacao-inicial` criada de `8b40c14`. A inspeção pelo Android UI Automator confirmou o título e a mensagem de cada tela após o toque nas abas e o retorno a Início. O botão Voltar do Android, acionado em Perfil, retornou a Início. As capturas mostram a seleção de cada destino e a barra acima dos controles do sistema:

- [Início](evidence/orbity-inicio-android.png)
- [Tarefas](evidence/orbity-tarefas-android.png)
- [Rotinas](evidence/orbity-rotinas-android.png)
- [Cosmos](evidence/orbity-cosmos-android.png)
- [Perfil](evidence/orbity-perfil-android.png)
- [Texto ampliado a 200%](evidence/orbity-large-text-android.png)

Com escala de fonte a 200%, títulos, mensagens e rótulos continuaram visíveis e acionáveis. Os rótulos da barra quebram em duas linhas na largura de 360 dp do emulador; uma composição específica para essa escala pode ser refinada sem mudar o roteamento.

Comandos locais: `npm run lint`, `npx --no-install tsc --noEmit` e `npm test` concluíram com sucesso (4 suítes, 10 testes). A execução em Expo Go comprova o shell em Android local; build EAS e publicação não fazem parte desta validação.
