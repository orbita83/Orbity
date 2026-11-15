# Catálogo de épicos

Este catálogo reúne os épicos do Orbity e liga cada épico à sua especificação. Os épicos descrevem objetivos e capacidades que podem ser detalhados em histórias de usuário.

| ID | Título do épico | Especificação |
| -- | --------------- | ------------- |
| EP-0000 | Fundação do Orbity | [EP-0000](EP-0000.md) |

## Como adicionar um épico

1. Escolha o próximo identificador sequencial disponível no formato `EP-0001`, `EP-0002` e assim por diante, sempre com quatro dígitos. O identificador `EP-0000` é reservado ao épico de fundação técnica do projeto; os épicos funcionais seguem a partir de `EP-0001`.
2. Crie a especificação em um arquivo com o mesmo identificador dentro de `docs/03-backlog/epics/`, por exemplo, `EP-0001.md`, usando o template `docs/07-templates/EP.template.md`.
3. Adicione uma linha à tabela acima com o identificador, o título e um link relativo para a especificação, por exemplo: `[EP-0001](EP-0001.md)`.

## Vínculos entre épicos e histórias de usuário

Ao adicionar, remover ou reatribuir histórias de usuário, atualize a seção **Histórias de usuário** da especificação do épico e a especificação da história correspondente para manter os vínculos entre EP e US consistentes. Use os identificadores reais das histórias e seus links corretos; os placeholders do template não representam histórias cadastradas.
