# [UC-0009] - Editar rotina

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0009 |
| **Nome** | Editar rotina |
| **Ator principal** | Estudante |
| **Objetivo** | Modificar as informações, tarefas associadas e dias da semana ativos de uma rotina |

## 2. Contexto

Permite ao estudante alterar as configurações de uma rotina já existente, incluindo o nome, a composição e ordem das tarefas e os dias de recorrência semanal. O caso de uso viabiliza o aperfeiçoamento contínuo dos hábitos de estudo de acordo com a evolução da rotina do usuário.

## 3. Pré-condições

- Deve existir ao menos uma rotina cadastrada no sistema.
- A rotina deve estar acessível para edição a partir da listagem ou da tela de detalhe.

## 4. Pós-condições

- As alterações nos dados da rotina, nas tarefas associadas e nos dias da semana ativos devem ser salvas.
- A programação de ocorrências futuras deve refletir imediatamente a nova configuração semanal estabelecida.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0009 | Edição e reconfiguração de rotina | [FL-0009](../flows/FL-0009.md) |
