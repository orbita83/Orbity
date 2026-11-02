# [UC-0006] - Reabrir tarefa

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0006 |
| **Nome** | Reabrir tarefa |
| **Ator principal** | Estudante |
| **Objetivo** | Retornar uma tarefa concluída para a condição de pendente |

## 2. Contexto

Permite ao estudante desfazer a marcação de conclusão de uma tarefa previamente finalizada, possibilitando retomar afazeres que precisam de revisão ou continuação. Preserva as informações originais da tarefa e mantém válido o registro de atividade do dia em que a tarefa foi originalmente concluída.

## 3. Pré-condições

- Deve existir ao menos uma tarefa com estado concluído acessível na listagem correspondente.

## 4. Pós-condições

- A tarefa deve retornar ao estado pendente, reaparecendo na lista de pendentes e sendo removida da seção de concluídas.
- As informações cadastrais da tarefa devem ser integralmente preservadas.
- O registro de atividade diária já consolidado no dia não deve ser invalidado pelo ato de reabertura.
- Se a tarefa fizer parte de uma rotina concluída no dia corrente, a ocorrência diária da rotina deve ser recalculada conforme as regras de negócio.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0006 | Reabertura e desmarcação de tarefa | [FL-0006](../flows/FL-0006.md) |
