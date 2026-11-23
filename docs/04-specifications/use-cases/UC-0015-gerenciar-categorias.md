# [UC-0015] - Gerenciar categorias

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0015 |
| **Nome** | Gerenciar categorias |
| **Ator principal** | Estudante |
| **Objetivo** | Listar, criar, renomear, trocar o ícone e excluir as categorias de estudo usadas em tarefas e rotinas |

## 2. Contexto

As categorias classificam tarefas ([UC-0001](UC-0001-criar-tarefa.md)) e dão o ícone das rotinas ([UC-0005](UC-0005-criar-rotina.md)). O sistema oferece seis categorias padrão ([RN-0010](../../02-requirements/business-rules/RN-0010.md)), e o estudante pode criar outras. O nome segue [RN-0008](../../02-requirements/business-rules/RN-0008.md), e a exclusão de uma categoria em uso segue [RN-0009](../../02-requirements/business-rules/RN-0009.md). A opção **Categorias** fica na tela **Meu perfil** ([UC-0014](UC-0014-consultar-perfil.md)).

*Ponto pendente de refinamento:* a tela de Categorias não tem desenho de alta fidelidade; ela segue os padrões do ODS já usados em Tarefas e no Perfil.

## 3. Pré-condições

- O estudante deve estar na opção **Categorias** da tela **Meu perfil**.

## 4. Pós-condições

- As alterações feitas nas categorias devem ficar salvas e aparecer em Tarefas e Rotinas.
- As tarefas e rotinas existentes devem continuar cadastradas.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0015 | Gerenciamento de categorias | [FL-0015](../flows/FL-0015.md) |
