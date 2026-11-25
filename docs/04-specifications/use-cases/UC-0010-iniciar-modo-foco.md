# [UC-0010] - Iniciar modo foco

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0010 |
| **Nome** | Iniciar modo foco |
| **Ator principal** | Estudante |
| **Objetivo** | Iniciar uma sessão do modo foco vinculada a uma tarefa ou rotina |

## 2. Contexto

O modo foco é acessado pelo card **Modo Foco** no painel deslizante da Tela Inicial, abrindo a tela dedicada de sessão (`/focus-session`). Nela, o estudante seleciona obrigatoriamente uma tarefa avulsa ou rotina ativa ([RN-0001](../../02-requirements/business-rules/RN-0001.md)), escolhe a duração do ciclo de foco entre 5 e 30 minutos ([RF-0019](../../02-requirements/functional/RF-0019.md)) e conduz os ciclos de foco, pausa curta (5 min) e pausa longa (15 min a cada 4 ciclos), podendo pausar, retomar e encerrar a sessão a qualquer momento. Durante a sessão ativa, a barra de abas inferior permanece oculta e o visualizador de sequência exibe o efeito e os atributos progressivos do modo foco ([RN-0006](../../02-requirements/business-rules/RN-0006.md)).

## 3. Pré-condições

- O painel deslizante da tela inicial deve estar aberto (ou o estudante deve possuir uma sessão de foco ativa em andamento).
- Deve existir ao menos uma tarefa avulsa ou rotina ativa para vinculação ([EC-0001](../edge-cases/EC-0001-inicio-modo-foco-sem-tarefa-ou-rotina.md)).

## 4. Pós-condições

- A sessão do modo foco é persistida localmente com horário de término (`cycleEndsAt`) confiável em segundo plano e vinculada à tarefa ou rotina escolhida.
- Uma notificação local (`focus-cycle-end`) é agendada para avisar o fim do ciclo quando o aplicativo não estiver em primeiro plano (se houver permissão), sendo cancelada ao pausar ou encerrar.
- O visualizador de sequência exibe o efeito e a evolução progressiva do modo foco enquanto a sessão estiver ativa ([RN-0006](../../02-requirements/business-rules/RN-0006.md)), voltando ao estado normal ao encerrar ([EC-0007](../edge-cases/EC-0007-interrupcao-sessao-modo-foco-em-andamento.md)).
- Ao encerrar a sessão, os minutos efetivamente focados ficam registrados para exibição no card **Última sessão** da Tela Inicial, sem alterar a sequência nem concluir automaticamente a atividade vinculada.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0010 | Início de sessão do modo foco | [FL-0010](../flows/FL-0010.md) |
