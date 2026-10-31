# Especificação de Requisitos de Software (ERS)

| Campo | Informação |
| --- | --- |
| **Projeto** | Orbity |
| **Versão** | 0.1.0 |
| **Status** | Em elaboração |
| **Última alteração** | 31/10/2026 |

## 1. Introdução

### 1.1 Objetivo

Este documento apresenta a Especificação de Requisitos de Software (ERS) do Orbity.

O objetivo é centralizar o catálogo de requisitos do sistema, permitindo sua identificação, consulta e rastreabilidade ao longo do desenvolvimento.

### 1.2 Visão geral do sistema

O Orbity é um aplicativo de organização pessoal focado em estudantes, desenvolvido para auxiliar no planejamento e gerenciamento de suas atividades, estudos e compromissos. O aplicativo permite criar e gerenciar tarefas, agendar atividades e estabelecer rotinas, possibilitando que o estudante organize e acompanhe suas responsabilidades de acordo com suas necessidades.

O Orbity também contempla elementos de gamificação, como sequências de atividade, conquistas e estrelas, destinados a incentivar a constância e valorizar o progresso do estudante.

### 1.3 Escopo deste documento

Esta versão da ERS contempla exclusivamente os requisitos funcionais (RF).

Regras de negócio (RN) e requisitos não funcionais (RNF) poderão ser incorporados em versões posteriores.

## 2. Organização dos requisitos

### 2.1 Identificação

Cada requisito possui um identificador único no formato `[RF-XXXX]`. Todos os requisitos utilizam o mesmo modelo, descrito em [`docs/07-templates/RF.template.md`](../07-templates/RF.template.md).

### 2.2 Especificações individuais

- Cada requisito funcional é documentado em um arquivo Markdown próprio, localizado no diretório [`docs/02-requirements/functional/`](functional/).
- Cada requisito funcional, requisito não funcional ou regra de negócio deve seguir os modelos registrados na documentação do sistema.
- A ERS deve apresentar o catálogo central de requisitos de forma a permitir a rastreabilidade, enquanto os arquivos individuais descrevem suas condições, seus resultados esperados e seus critérios de aceitação.

### 2.3 Rastreabilidade

A rastreabilidade é estabelecida por meio dos identificadores e links entre o catálogo e as especificações individuais.

Os identificadores devem sempre ser utilizados quando necessário como referência em outros artefatos do projeto, incluindo issues, especificações, testes e pull requests.

O catálogo deve ser mantido sincronizado com os arquivos individuais a cada atualização dos requisitos funcionais ou não funcionais.

## 3. Catálogo de requisitos funcionais

Esta seção reúne os requisitos funcionais do Orbity.

| ID | Título | Descrição | Especificação |
| --- | --- | --- | --- |
| RF-0001 | Criar tarefa | Permitir que o estudante crie tarefas para organizar suas atividades pessoais e acadêmicas. | [RF-0001](./functional/RF-0001.md) |
| RF-0002 | Consultar tarefas | Permitir que o estudante consulte suas tarefas cadastradas e acompanhe suas atividades. | [RF-0002](./functional/RF-0002.md) |
| RF-0003 | Editar tarefa | Permitir que o estudante edite tarefas cadastradas e atualize suas informações. | [RF-0003](./functional/RF-0003.md) |
| RF-0004 | Excluir tarefa | Permitir que o estudante exclua tarefas cadastradas que não deseja mais manter. | [RF-0004](./functional/RF-0004.md) |

## 4. Manutenção e evolução

A ERS deve ser atualizada sempre que houver inclusão, alteração ou descontinuação de requisitos.

As alterações devem preservar a identificação dos requisitos existentes e manter a correspondência entre o catálogo e suas especificações individuais.

Requisitos descontinuados não devem ter seus identificadores reutilizados.
