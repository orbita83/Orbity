# [UC-0011] - Atualizar sequência de estudos

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0011 |
| **Nome** | Atualizar sequência de estudos |
| **Ator principal** | Sistema |
| **Objetivo** | Atualizar automaticamente a sequência de estudos e a constelação do estudante |

## 2. Contexto

Sempre que o estudante conclui uma rotina ou tarefa, o sistema avalia automaticamente se a sequência deve aumentar, conforme [RN-0002](../../02-requirements/business-rules/RN-0002.md), e faz a constelação progredir junto com a sequência ([RN-0003](../../02-requirements/business-rules/RN-0003.md)).

## 3. Pré-condições

- Uma tarefa ou rotina deve ter sido concluída pelo estudante ([UC-0003](UC-0003-concluir-tarefa.md) ou [UC-0008](UC-0008-concluir-rotina.md)).

## 4. Pós-condições

- O dia local da conclusão fica registrado uma vez; a sequência é recalculada na leitura a partir dos dias registrados ([RF-0014](../../02-requirements/functional/RF-0014.md), [RF-0015](../../02-requirements/functional/RF-0015.md)). A constelação acompanha a sequência ([RN-0003](../../02-requirements/business-rules/RN-0003.md)).
- Conclusões adicionais no mesmo dia não devem gerar novo incremento ([EC-0004](../edge-cases/EC-0004-multiplas-conclusoes-no-mesmo-dia.md)).

> **Entrega parcial (2026-11-14):** o design [`tela-inicial-base.md`](../../designs/tela-inicial-base.md) entrega o registro diário e o cálculo da sequência. A parte de constelação e conquistas não é entregue nessa mudança.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0011 | Atualização automática da sequência | [FL-0011](../flows/FL-0011.md) |
