# [UC-0004] - Gerenciar tarefas selecionadas

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0004 |
| **Nome** | Gerenciar tarefas selecionadas |
| **Ator principal** | Estudante |
| **Objetivo** | Selecionar uma ou mais tarefas para fixá-las, marcá-las ou excluí-las |

## 2. Contexto

Ao pressionar e segurar (*long-press*) uma tarefa, o estudante entra no modo de seleção. Nesse modo, a barra de navegação é substituída por uma barra de ações contextuais com as ações **Fixar**, **Marcar todas** (que permite marcar e desmarcar) e **Excluir**, e o cabeçalho informa a quantidade de itens selecionados.

## 3. Pré-condições

- Deve existir ao menos uma tarefa cadastrada na lista de tarefas.

## 4. Pós-condições

- A ação escolhida deve ser aplicada às tarefas selecionadas.
- Ao sair do modo de seleção, a barra de navegação deve voltar a ser exibida.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0004 | Seleção múltipla e ações contextuais de tarefas | [FL-0004](../flows/FL-0004.md) |
