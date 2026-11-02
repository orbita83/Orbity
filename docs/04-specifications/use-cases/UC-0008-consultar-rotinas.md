# [UC-0008] - Consultar rotinas

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0008 |
| **Nome** | Consultar rotinas |
| **Ator principal** | Estudante |
| **Objetivo** | Visualizar as rotinas cadastradas, seus dias programados e tarefas associadas |

## 2. Contexto

Possibilita ao estudante consultar a programação de seus hábitos de estudo e blocos de rotinas, inspecionando quais tarefas compõem cada rotina e em quais dias da semana estão agendadas para execução. Exibe estado vazio acolhedor caso nenhuma rotina tenha sido criada ainda.

## 3. Pré-condições

- O aplicativo deve estar em execução e a aba de rotinas acessível na barra de navegação.

## 4. Pós-condições

- As rotinas cadastradas devem ser listadas com seus dados resumidos e indicadores de dias ativos.
- Ao selecionar uma rotina, seus detalhes e a lista ordenada de tarefas associadas devem estar visíveis para consulta.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0008 | Consulta e detalhamento de rotinas | [FL-0008](../flows/FL-0008.md) |
