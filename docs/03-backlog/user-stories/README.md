# Catálogo de histórias de usuário

Este catálogo reúne as histórias de usuário do Orbity e permite consultar cada história individualmente, sem precisar ler todas as histórias do backlog.

O catálogo contém quatro histórias de usuário cadastradas.

| ID | Título | RFs relacionados | Arquivo US |
| -- | ------ | ---------------- | ---------- |
| US-0001 | Criar tarefas | [RF-0001](../../02-requirements/functional/RF-0001.md) | [US-0001](US-0001.md) |
| US-0002 | Visualizar tarefas | [RF-0002](../../02-requirements/functional/RF-0002.md) | [US-0002](US-0002.md) |
| US-0003 | Editar tarefa | [RF-0003](../../02-requirements/functional/RF-0003.md) | [US-0003](US-0003.md) |
| US-0004 | Excluir tarefas | [RF-0004](../../02-requirements/functional/RF-0004.md) | [US-0004](US-0004.md) |

## Como adicionar uma história de usuário

1. Escolha o próximo identificador sequencial disponível no formato `US-0001`, `US-0002` e assim por diante, sempre com quatro dígitos.
2. Crie um arquivo individual neste diretório, usando o padrão `US-XXXX.md`, por exemplo, `US-0001.md`, e o template `docs/07-templates/US.template.md`.
3. Adicione uma linha à tabela acima com o identificador, o título, os requisitos funcionais relacionados e um link relativo para o arquivo US, por exemplo, `[US-0001](US-0001.md)`.

## Vínculos entre histórias e requisitos funcionais

Cada história pode estar relacionada a um ou mais requisitos funcionais (RF). Registre somente relacionamentos US–RF confirmados e validados; não deduza nem invente associações. Mantenha o catálogo sincronizado com as histórias cadastradas e os requisitos funcionais, usando identificadores reais e links relativos válidos. Ao alterar ou remover uma história ou requisito relacionado, atualize o catálogo para manter as referências consistentes.
