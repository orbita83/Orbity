# [UC-0010] - Iniciar modo foco

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0010 |
| **Nome** | Iniciar modo foco |
| **Ator principal** | Estudante |
| **Objetivo** | Iniciar uma sessão do modo foco vinculada a uma tarefa ou rotina |

## 2. Contexto

O modo foco é acessado exclusivamente pelo painel deslizante da tela inicial, que pergunta **Iniciar o modo foco?** e oferece a ação **Iniciar**. Toda sessão deve estar vinculada a uma tarefa ou rotina ([RN-0001](../../02-requirements/business-rules/RN-0001.md)), e o visualizador de sequência recebe um efeito próprio durante a sessão ([RN-0006](../../02-requirements/business-rules/RN-0006.md)).

*Ponto pendente de refinamento:* as telas de seleção da atividade vinculada e de sessão em andamento não estão representadas no protótipo.

## 3. Pré-condições

- O painel deslizante da tela inicial deve estar aberto.
- Deve existir ao menos uma tarefa ou rotina para vinculação ([EC-0001](../edge-cases/EC-0001-inicio-modo-foco-sem-tarefa-ou-rotina.md)).

## 4. Pós-condições

- A sessão do modo foco deve estar ativa e vinculada a uma tarefa ou rotina.
- O visualizador de sequência deve exibir o efeito do modo foco enquanto a sessão estiver ativa.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0010 | Início de sessão do modo foco | [FL-0010](../flows/FL-0010.md) |
