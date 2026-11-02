# [UC-0002] - Consultar tarefas

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0002 |
| **Nome** | Consultar tarefas |
| **Ator principal** | Estudante |
| **Objetivo** | Visualizar a listagem de tarefas cadastradas, filtrar por estado e consultar seus detalhes |

## 2. Contexto

Possibilita ao estudante acompanhar suas atividades cadastradas, distinguindo tarefas pendentes e concluídas por meio de abas ou filtros de visualização. Permite também inspecionar os detalhes individuais de cada tarefa e visualizar um estado informativo acolhedor quando não houver tarefas cadastradas.

## 3. Pré-condições

- O aplicativo deve estar em execução com a aba de tarefas disponível para navegação.

## 4. Pós-condições

- As tarefas cadastradas devem ser apresentadas de acordo com o filtro selecionado (pendentes ou concluídas).
- Na ausência de tarefas, um estado vazio informativo deve ser apresentado com incentivo ao cadastro inicial.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0002 | Consulta e filtragem de tarefas | [FL-0002](../flows/FL-0002.md) |
