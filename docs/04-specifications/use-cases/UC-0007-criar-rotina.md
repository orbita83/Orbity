# [UC-0007] - Criar rotina

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0007 |
| **Nome** | Criar rotina |
| **Ator principal** | Estudante |
| **Objetivo** | Cadastrar uma rotina recorrente de estudos composta por tarefas e dias ativos |

## 2. Contexto

Permite ao estudante criar blocos estruturados de hábitos e atividades recorrentes. No cadastro, o estudante define o nome da rotina, associa as tarefas que a integram e seleciona os dias da semana em que as ocorrências deverão ser executadas, viabilizando o planejamento de médio e longo prazo.

## 3. Pré-condições

- O aplicativo deve estar em execução e a aba ou tela de rotinas acessível.

## 4. Pós-condições

- A nova rotina deve estar persistida e visível na listagem de rotinas cadastradas.
- As tarefas associadas e a seleção dos dias da semana devem permanecer vinculadas à rotina.
- As próximas ocorrências da rotina devem ser programadas para aparecer nos dias da semana definidos.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0007 | Criação de rotina e definição de recorrência | [FL-0007](../flows/FL-0007.md) |
