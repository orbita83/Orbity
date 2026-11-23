# Estrelas por aumento da sequência: domínio, persistência e integração com a Início

> **Status:** Approved · **Autor:** AlissonSena7 · **Data:** 2026-11-22

## Overview

Cria o registro persistente de estrelas (`Star`) do estudante no domínio e no SQLite (migração de banco para a tabela `stars`), integrando a concessão idempotente de uma estrela a cada aumento da sequência diária ([RF-0017](../02-requirements/functional/RF-0017.md), [RN-0003](../02-requirements/business-rules/RN-0003.md)). Também expõe a consulta da lista e do total de estrelas para desbloquear a tela Cosmos e as conquistas, além de apresentar um retorno acolhedor na Tela Inicial quando uma estrela de sequência é conquistada no dia.

## The Problem

- A sequência diária já é calculada a partir da tabela `daily_activity`, mas nenhum registro de estrela é criado quando o estudante avança na sequência.
- As futuras entregas da tela Cosmos e das conquistas dependem de uma entidade `Star` e de um `IStarDataSource` capaz de distinguir estrelas geradas por sequência (`sourceType: "streak"`) e por conquista (`sourceType: "achievement"`).

## Goals

- **G1:** Conceder exatamente 1 estrela a cada aumento da sequência diária (`RF-0017 CA-01` e `CA-04`), identificada pela chave única `streak:<AAAA-MM-DD>`.
- **G2:** Garantir que zerar a sequência ou reabrir uma atividade concluída nunca remova estrelas já conquistadas (`RN-0003 CA-02`).
- **G3:** Persistir as estrelas em SQLite entre aberturas do aplicativo (`RF-0017 CA-03`), concedendo retroativamente na migração uma estrela para cada dia já presente em `daily_activity`.
- **G4:** Expor o total de estrelas e se a estrela de sequência de hoje já foi conquistada no `HomeSummary` da Tela Inicial.

## Non-Goals

- Grafo visual da constelação na tela Cosmos.
- Regras de desbloqueio das conquistas e concessão de estrelas do tipo `"achievement"` (que reutilizarão a mesma entidade `Star` e `IStarDataSource`).

## Decisions

- **S1 — Identificação idempotente por `eventKey`:** toda estrela possui um `eventKey` único (`UNIQUE` no SQLite). Para aumentos de sequência, `eventKey = "streak:<AAAA-MM-DD>"`. Concluir várias tarefas ou rotinas no mesmo dia, ou reabrir e concluir novamente, executa `INSERT OR IGNORE` sobre o mesmo `event_key` e nunca duplica a estrela.
- **S2 — Concessão retroativa na migração:** a migração que cria a tabela `stars` copia os registros existentes de `daily_activity` com `INSERT OR IGNORE INTO stars ... SELECT ... FROM daily_activity`, garantindo que estudantes que já tinham dias registrados na `v0.1.0` recebam as estrelas correspondentes.
- **S3 — Permanência sem punição:** `IStarDataSource` não possui método de exclusão. Uma vez ganha, a estrela permanece na constelação mesmo que a sequência zere em dias futuros (`RN-0003 CA-02`).
- **S4 — Retorno acolhedor na Tela Inicial:** `HomeSummary` passa a incluir `stars: { total: number; earnedToday: boolean }`. Quando `earnedToday` é `true`, o card "Seu progresso" exibe uma mensagem acolhedora celebrando a estrela conquistada hoje.

## Technical Plan (Architecture)

1. **Domínio (`src/model/`):**
   - `entities/star.ts`: tipos `StarSourceType = "streak" | "achievement"`, `Star` e helper `createStreakStar(date, createdAt)`.
   - `datasources/iStarDataSource.ts`: `awardIfNew(star): Promise<boolean>`, `listAll(): Promise<Star[]>` e `countAll(): Promise<number>`.
   - `entities/homeSummary.ts`: tipo `HomeStarsSummary = { total: number; earnedToday: boolean }` adicionado a `HomeSummary`.
2. **Infraestrutura (`src/infra/`):**
   - `database/migrations.ts`: nova migração criando a tabela `stars` com índice único em `event_key` e backfill a partir de `daily_activity`.
   - `datasources/sqliteStarDataSource.ts`, `datasources/memoryStarDataSource.ts` e `datasources/starDataSource.contract.ts`.
3. **Casos de Uso e Composição (`src/usecase/` e `src/di/`):**
   - `StreakUseCases`: recebe `IStarDataSource`, concede a estrela `createStreakStar(today, now)` em `recordActivity` e expõe `listStars()` e `getStarCount()`.
   - `TaskUseCases` e `RoutineUseCases`: ao registrar o dia em `dailyActivity`, também concedem a estrela do dia no `IStarDataSource` (quando fornecido).
   - `HomeUseCases`: lê `stars` do `IStarDataSource` e preenche `summary.stars`.
4. **Apresentação (`src/view/`):**
   - `homeCopy.ts` e `FocusBottomSheet.tsx`: exibe o retorno acolhedor quando `earnedToday` for verdadeiro.
