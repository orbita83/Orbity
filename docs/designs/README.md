# Designs técnicos (EGM)

Este diretório reúne os designs técnicos do Orbity, produzidos com o Elephant-Goldfish Model (EGM). Cada funcionalidade **que usa o EGM** tem **um** arquivo `<funcionalidade>.md`, que é a especificação de referência para implementá-la e revisá-la.

O uso do EGM é **opcional** ([`AGENTS.md`](../../AGENTS.md), Seção 4): uma atividade pode ser implementada sem design técnico. Quando a funcionalidade tem design aqui, a implementação segue o design, e qualquer divergência é registrada atualizando o design no mesmo Pull Request ([`CONTRIBUTING.md`](../../CONTRIBUTING.md), Seção 2.6).

## Como o EGM organiza os artefatos

| Onde | O que fica | Vai para o Git? |
| :--- | :--- | :--- |
| `docs/designs/<funcionalidade>.md` | Design final: problema, objetivos, decisões, plano técnico, alternativas e plano de implementação. | Sim |
| `docs/designs/README.md` | Este índice. Todo design novo ganha uma linha na tabela abaixo. | Sim |
| `.dev/egm/` | Artefatos de trabalho da tarefa **em andamento**: `concepts_brief.md` (`/egm:egm-brainstorm`), `design_draft.md` (`/egm:egm-draft`), relatórios de revisão (`/egm:egm-review`, `/egm:egm-resolve`) e `AAAA-MM-DD_DRIFT_REPORT.md` (`/egm:egm-drift-report`). Os nomes são fixos, então a pasta comporta uma tarefa por vez. | Não (`.gitignore`) |

A pasta de trabalho é definida pela linha `EGM artifact directory: .dev/egm` no [`AGENTS.md`](../../AGENTS.md).

### Ciclo de uma tarefa

1. `/egm:egm-brainstorm` → `.dev/egm/concepts_brief.md`.
2. `/egm:egm-draft` → `.dev/egm/design_draft.md` → `docs/designs/<funcionalidade>.md`, mais uma linha neste índice.
3. `/egm:egm-review docs/designs/<funcionalidade>.md` → relatórios em `.dev/egm/`, e `/egm:egm-resolve` para tratar os achados.
4. Revisão humana e implementação. O PR que conclui a implementação muda o status para `Implemented`, no índice e no cabeçalho do design.
5. Antes de começar a próxima tarefa, apagar ou mover o conteúdo de `.dev/egm/`. As decisões que importam já estão no design.

## Índice

| Documento | Autor | Status | Componente principal |
| :-------- | :---- | :----- | :------------------- |
| [categorias.md](categorias.md)<br>Categorias de estudo como dados do domínio: entidade, DataSource (SQLite e em memória), migração v6 com as seis padrão, casos de uso e integração nas telas de Tarefas, Rotinas e Perfil → Categorias. Issues #212 e #213. | MailsonSousa88 | Implemented | Perfil → Categorias, [ADR-0001](../05-architecture/decisions/ADR-0001.md) |
| [modo-foco-pomodoro.md](modo-foco-pomodoro.md)<br>Cronômetro pomodoro do Modo Foco: ciclos de foco e pausa (5/15 min), tempo confiável por `cycleEndsAt` (migração v7), vínculo obrigatório (RN-0001, EC-0008), notificação local de fim de ciclo e evolução visual do planeta (RN-0006). Issue #217. | AlissonSena7 | Implemented | Tela Modo Foco ([UC-0010](../04-specifications/use-cases/UC-0010-iniciar-modo-foco.md)), [ADR-0001](../05-architecture/decisions/ADR-0001.md), [ADR-0002](../05-architecture/decisions/ADR-0002.md) |
| [notificacoes-tarefas.md](notificacoes-tarefas.md)<br>Notificações locais para tarefas avulsas agendadas: agendamento determinístico, atualização, cancelamento, reabertura, reconciliação, permissão não bloqueante e navegação para a aba Tarefas. Issue #211. | AlissonSena7 | Implemented | Tela Tarefas ([UC-0016](../04-specifications/use-cases/UC-0016-notificar-tarefas-agendadas.md)), [ADR-0002](../05-architecture/decisions/ADR-0002.md) |
| [rotinas.md](rotinas.md)<br>Domínio, persistência (migração v3) e integração de Rotinas com a sequência. As tarefas da rotina são `Task` com `routineId`, guardam o estado por dia, e a exclusão tem desfazer. Continua o PR #130 (issue #132). | MateusARJ | Implemented | Tela Rotinas, [ADR-0001](../05-architecture/decisions/ADR-0001.md) |
| [tarefas.md](tarefas.md)<br>Domínio, persistência (migração v2) e integração de Tarefas com a Início e a sequência. Escrito depois da implementação do PR #129 (issue #131). | vitorlopes-coder, MailsonSousa88 | Implemented | Tela Tarefas, [ADR-0001](../05-architecture/decisions/ADR-0001.md) |
| [tela-inicial-base.md](tela-inicial-base.md)<br>Base da tela Início: sequência calculada pelo registro diário em SQLite, trava do Modo Foco e barra de progresso, partindo do protótipo `feat/tela-principal-prototipo`. Motor do foco adiado para a mudança de Tarefas. | MailsonSousa88 | Approved | Tela Início ([UC-0009](../04-specifications/use-cases/UC-0009-consultar-tela-inicial.md)), [ADR-0001](../05-architecture/decisions/ADR-0001.md) |

## Status

| Status | Significado |
| :--- | :--- |
| `Draft` | Em escrita no `/egm:egm-draft`. |
| `Proposed` | Escrito e aguardando `/egm:egm-review` e revisão humana. |
| `In Review` | Revisão EGM ou humana em andamento. |
| `Approved` | Aprovado; pode ser implementado. |
| `Implemented` | Implementado na `development`. O design registra o que foi entregue e é a referência para mudar a funcionalidade. O cabeçalho do design diz se ele passou pelo `/egm:egm-review`. |
