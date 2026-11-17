# [UC-0007] - Editar rotina

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0007 |
| **Nome** | Editar rotina |
| **Ator principal** | Estudante |
| **Objetivo** | Alterar as informações de uma rotina existente |

## 2. Contexto

Permite ao estudante iniciar a edição de uma rotina pela ação **Editar** exibida no detalhe da rotina.

A edição reaproveita o formulário de Nova rotina (protótipo 3.1), com o título **Editar rotina** e os campos já preenchidos: nome, ícone, descrição, dias da semana e tarefas (adicionar, remover e reordenar). A confirmação é a ação **Salvar alterações**, seguida da mensagem **Rotina atualizada!**. A edição vale em qualquer dia, inclusive fora dos dias da rotina.

As alterações não punem o estudante (decisão de refinamento da issue #137):

- Remover uma tarefa descarta a marcação dela de hoje. A conclusão da rotina e a sequência não mudam.
- Uma tarefa adicionada a uma rotina já concluída hoje entra desmarcada, e a rotina continua concluída ([RN-0004](../../02-requirements/business-rules/RN-0004.md) só marca tarefas no momento da conclusão).
- Tirar o dia de hoje dos dias de uma rotina já concluída hoje mantém a conclusão de hoje.
- Renomear ou reordenar uma tarefa mantém a marcação dela, porque continua sendo a mesma tarefa.

## 3. Pré-condições

- Deve existir ao menos uma rotina cadastrada.
- O detalhe da rotina deve estar aberto.

## 4. Pós-condições

- As alterações confirmadas devem estar registradas e refletidas no detalhe e na lista de rotinas.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0007 | Edição de rotina | [FL-0007](../flows/FL-0007.md) |
