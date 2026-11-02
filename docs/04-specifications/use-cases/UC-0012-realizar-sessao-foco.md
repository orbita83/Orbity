# [UC-0012] - Realizar sessão de foco

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0012 |
| **Nome** | Realizar sessão de foco |
| **Ator principal** | Estudante |
| **Objetivo** | Executar uma sessão de estudo temporizada com cronômetro regressivo vinculada a uma atividade |

## 2. Contexto

Permite ao estudante dedicar períodos ininterruptos de concentração a uma tarefa ou rotina selecionada, utilizando o painel deslizante do Modo Foco. Durante a sessão, o cronômetro regressivo é exibido e a barra de navegação fica temporariamente oculta para minimizar distrações. Ao término ou interrupção, apenas os minutos efetivamente decorridos são contabilizados no progresso diário de horas dedicadas.

## 3. Pré-condições

- O estudante deve selecionar uma tarefa ou rotina cadastrada para vincular à sessão de foco.
- Não deve haver outra sessão de foco em andamento no aplicativo.

## 4. Pós-condições

- Os minutos efetivamente decorridos de estudo concentrado devem ser somados ao histórico diário e ao total acumulado de horas do estudante.
- A barra de navegação e os controles habituais do aplicativo devem ser restaurados após o encerramento da sessão.
- O visualizador de sequência e o painel de atividades devem refletir o tempo e o progresso da sessão concluída.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0012 | Sessão do modo foco e cronometragem regressiva | [FL-0012](../flows/FL-0012.md) |
