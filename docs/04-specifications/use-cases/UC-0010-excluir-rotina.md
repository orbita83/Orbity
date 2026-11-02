# [UC-0010] - Excluir rotina

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0010 |
| **Nome** | Excluir rotina |
| **Ator principal** | Estudante |
| **Objetivo** | Remover uma rotina cadastrada que não é mais necessária |

## 2. Contexto

Permite ao estudante remover rotinas obsoletas ou descontinuadas de seu planejamento pessoal. A exclusão exige solicitação explícita para evitar exclusões involuntárias e trata de maneira segura ocorrências passadas já registradas e vínculos com sessões ativas.

## 3. Pré-condições

- Deve existir ao menos uma rotina cadastrada no sistema.
- A rotina não deve estar vinculada a uma sessão ativa de modo foco em andamento, ou a sessão deve ser tratada previamente.

## 4. Pós-condições

- A rotina deve ser removida do sistema e deixar de ser exibida nas listagens e na programação semanal.
- Os registros de atividades já consolidadas em dias anteriores pelo cumprimento da rotina devem ser preservados.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0010 | Exclusão de rotina | [FL-0010](../flows/FL-0010.md) |
