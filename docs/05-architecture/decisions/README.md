# Catálogo de decisões arquiteturais (ADR)

Este catálogo reúne os Architecture Decision Records (`ADR`) do Orbity. Cada ADR registra individualmente uma decisão arquitetural relevante, seu contexto, as consequências positivas e negativas e os riscos assumidos, preservando o histórico das decisões técnicas do projeto. O modelo adotado é o de Michael Nygard (Status, Contexto, Decisão e Consequências), acrescido da seção de Riscos.

O catálogo está vazio: ainda não há decisões arquiteturais registradas.

| ID | Decisão | Status | Especificação |
| -- | ------- | ------ | ------------- |

## Status de uma decisão

| Status | Significado |
| ------ | ----------- |
| `Proposed` | Decisão proposta, em discussão e ainda não validada pela equipe. É o status inicial de todo ADR. |
| `Accepted` | Decisão validada pela equipe e adotada no projeto. |
| `Deprecated` | Decisão que deixou de ser recomendada ou aplicável, sem um ADR específico que a substitua. |
| `Superseded` | Decisão substituída por outro ADR, que deve ser referenciado no status (por exemplo, `Superseded por [ADR-0002](ADR-0002.md)`). |

Uma decisão só pode ser registrada como `Accepted` após validação da equipe.

## Como adicionar uma decisão arquitetural

1. Escolha o próximo identificador sequencial disponível no formato `ADR-0001`, `ADR-0002` e assim por diante, sempre com quatro dígitos. Identificadores são únicos e estáveis e não devem ser reutilizados.
2. Crie a especificação em um arquivo com o mesmo identificador dentro de `docs/05-architecture/decisions/`, por exemplo, `ADR-0001.md`, utilizando o template [`ADR.template.md`](../../07-templates/ADR.template.md).
3. Registre **apenas uma decisão arquitetural por documento**, com status inicial `Proposed`.
4. Preencha as seções do template: **1. Status**, **2. Contexto**, **3. Decisão**, **4. Consequências** (subseções **Positivas** e **Negativas**) e **5. Riscos**.
5. Adicione uma linha à tabela acima com o identificador, o título da decisão, o status atual e o link relativo para a especificação, por exemplo: `[ADR-0001](ADR-0001.md)`.

## Substituição e histórico das decisões

ADRs não são removidos nem reescritos para refletir uma nova decisão. Quando uma decisão for substituída:

1. Crie um novo ADR com a nova decisão e mencione, em seu contexto, o ADR anterior.
2. Altere o status do ADR anterior para `Superseded`, referenciando o novo ADR com link relativo.
3. Atualize a coluna **Status** de ambos neste catálogo.

Quando uma decisão deixar de valer sem substituta, altere seu status para `Deprecated` e atualize o catálogo. Mantenha o catálogo sincronizado com o status registrado em cada ADR.
