# Requisitos de Software — Orbity

Este diretório centraliza os requisitos de software do Orbity, organizando suas especificações e facilitando a consulta, manutenção e rastreabilidade durante o desenvolvimento.

Cada requisito possui um identificador único e uma especificação individual em Markdown, permitindo sua utilização como referência para implementação, testes e outros artefatos de engenharia de software.

## 1. Organização

Os requisitos são organizados por categoria, com seus respectivos arquivos de especificação.

| Categoria | Diretório | Identificação |
| --- | --- | --- |
| Requisitos Funcionais (RF) | [`functional/`](./functional/) | `RF-XXXX` |

Os requisitos funcionais seguem o modelo definido em [`RF.template.md`](../07-templates/RF.template.md).

## 2. Catálogo de Requisitos Funcionais

| ID | Requisito | Descrição |
| --- | --- | --- |
| [RF-0001](./functional/RF-0001.md) | Criar tarefa | Permitir a criação de tarefas para organização de atividades pessoais e acadêmicas. |
| [RF-0002](./functional/RF-0002.md) | Consultar tarefas | Permitir a consulta e o acompanhamento das tarefas cadastradas. |
| [RF-0003](./functional/RF-0003.md) | Editar tarefa | Permitir a atualização das informações de tarefas existentes. |
| [RF-0004](./functional/RF-0004.md) | Excluir tarefa | Permitir a exclusão de tarefas cadastradas. |
| [RF-0005](./functional/RF-0005.md) | Concluir tarefa | Permitir marcar tarefas pendentes como concluídas. |
| [RF-0006](./functional/RF-0006.md) | Reabrir tarefa | Permitir retornar tarefas concluídas à condição de pendentes. |
| [RF-0007](./functional/RF-0007.md) | Criar rotina | Permitir criar rotinas recorrentes compostas por tarefas. |
| [RF-0008](./functional/RF-0008.md) | Consultar rotinas | Permitir consultar rotinas e suas tarefas associadas. |
| [RF-0009](./functional/RF-0009.md) | Editar rotina | Permitir atualizar informações e tarefas de uma rotina. |
| [RF-0010](./functional/RF-0010.md) | Excluir rotina | Permitir excluir rotinas cadastradas. |
| [RF-0011](./functional/RF-0011.md) | Concluir ocorrência de rotina | Permitir registrar a conclusão de uma rotina em determinado dia. |
| [RF-0012](./functional/RF-0012.md) | Selecionar dias ativos da rotina | Permitir configurar os dias da semana de realização de uma rotina. |
| [RF-0013](./functional/RF-0013.md) | Agendar tarefa | Permitir definir datas e horários de início e término de tarefas. |
| [RF-0014](./functional/RF-0014.md) | Registrar atividade diária | Registrar os dias com conclusão de tarefas ou ocorrências de rotinas. |
| [RF-0015](./functional/RF-0015.md) | Gerenciar sequência diária | Gerenciar a sequência de dias consecutivos com atividade registrada. |
| [RF-0016](./functional/RF-0016.md) | Visualizar sequência diária | Permitir consultar a quantidade atual de dias consecutivos com atividade registrada. |
| [RF-0017](./functional/RF-0017.md) | Desbloquear estrelas | Conceder e acumular estrelas pelo aumento da sequência diária ou desbloqueio de conquistas. |

## 3. Rastreabilidade

A rastreabilidade dos requisitos é estabelecida por meio de seus identificadores únicos (`RF-XXXX`) e das referências utilizadas nos demais artefatos do projeto.

Os identificadores podem ser utilizados em:

- Issues e Pull Requests;
- Casos de uso;
- Regras de negócio;
- Casos de teste;
- Especificações técnicas;
- Entre outros.

## 4. Manutenção

- Cada requisito deve possuir um arquivo Markdown individual.
- Os identificadores existentes devem ser preservados durante alterações.
- Novos requisitos devem ser adicionados ao catálogo com seus respectivos links.
- Requisitos descontinuados não devem ter seus identificadores reutilizados.
- As especificações devem seguir os templates estabelecidos pelo projeto.

## 5. Ciclo de vida dos requisitos

Os requisitos do Orbity são definidos e refinados progressivamente, servindo como referência para o planejamento, implementação e validação das funcionalidades do sistema.

O processo compreende as seguintes etapas:

1. **Identificação:** levantamento da necessidade ou funcionalidade.
2. **Especificação:** documentação do requisito utilizando o template correspondente.
3. **Revisão:** análise da clareza, consistência e verificabilidade do requisito.
4. **Implementação:** desenvolvimento da funcionalidade conforme as especificações aprovadas.
5. **Validação:** verificação do atendimento aos requisitos por meio dos critérios de aceite e testes.

Alterações nos requisitos devem ser refletidas em suas especificações, preservando a rastreabilidade com os demais artefatos do projeto.
