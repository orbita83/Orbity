# [UC-0013] - Gerenciar sequência de estudos

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0013 |
| **Nome** | Gerenciar sequência de estudos |
| **Ator principal** | Sistema |
| **Objetivo** | Apurar, atualizar e manter a continuidade da sequência diária de estudos do estudante |

## 2. Contexto

Executa o cálculo e a manutenção da sequência (*streak*) ininterrupta de dias de atividade do estudante. O sistema avalia os registros diários gerados pela conclusão de tarefas e rotinas no fuso horário local, incrementando o contador na continuidade de dias, preservando o valor em dias sem atividade recente antes da virada de ciclo e zerando a sequência caso um dia inteiro termine sem o cumprimento das condições estabelecidas.

## 3. Pré-condições

- O aplicativo deve ser inicializado pelo estudante ou uma alteração de conclusão de atividade (tarefa/rotina) deve ser processada.

## 4. Pós-condições

- O contador de sequência deve ser atualizado com o valor exato correspondente à continuidade das atividades no fuso horário local.
- O progresso da constelação do usuário deve avançar de forma estritamente sincronizada com o novo valor da sequência.
- Múltiplas conclusões ocorridas no mesmo dia não devem gerar incrementos adicionais da sequência naquele mesmo ciclo diário.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0013 | Apuração e atualização da sequência diária | [FL-0013](../flows/FL-0013.md) |
