# Catálogo de regras de negócio

Este catálogo reúne as regras de negócio (`RN`) do Orbity e relaciona cada regra à sua especificação individual e aos requisitos funcionais (`RF`) correspondentes. O objetivo é permitir que desenvolvedores e agentes de IA consultem apenas as regras necessárias à implementação e validação de cada funcionalidade.

| ID | Título da regra de negócio | Requisitos funcionais relacionados | Especificação |
| -- | -------------------------- | ---------------------------------- | ------------- |
| RN-0001 | Vinculação de sessão ativa do modo foco a tarefa ou rotina | — | [RN-0001](RN-0001.md) |
| RN-0002 | Contabilização de rotina e tarefa avulsa no contador de sequência | — | [RN-0002](RN-0002.md) |
| RN-0003 | Progressão conjunta entre sequência e constelação do usuário | — | [RN-0003](RN-0003.md) |
| RN-0004 | Marcação automática das tarefas associadas ao concluir uma rotina | — | [RN-0004](RN-0004.md) |
| RN-0005 | Alcance de conquistas pelo progresso da constelação do usuário | — | [RN-0005](RN-0005.md) |
| RN-0006 | Evolução do visualizador de sequência durante o modo foco | — | [RN-0006](RN-0006.md) |

## Como adicionar uma regra de negócio

1. Escolha o próximo identificador sequencial disponível no formato `RN-0001`, `RN-0002` e assim por diante, sempre com quatro dígitos. Identificadores são únicos e estáveis e não devem ser reutilizados caso uma regra seja descontinuada.
2. Crie a especificação em um arquivo com o mesmo identificador dentro de `docs/02-requirements/business-rules/`, por exemplo, `RN-0007.md`, utilizando o template [`RN.template.md`](../../07-templates/RN.template.md).
3. Especifique **apenas uma regra de negócio por documento**, evitando misturar condições, restrições ou políticas independentes no mesmo arquivo.
4. Preencha exclusivamente as seções definidas no template:
   - **1. Contexto:** finalidade da regra, sua necessidade e as situações em que deve ser aplicada.
   - **2. Regra de negócio:** condição, restrição ou política formulada de maneira objetiva e inequívoca.
   - **3. Critérios de aceite:** condições verificáveis identificadas como `CA-01`, `CA-02` etc., abrangendo o atendimento e, quando aplicável, a violação da regra, na quantidade necessária para validá-la (os itens do template são apenas exemplos editáveis, sem quantidade fixa obrigatória).
5. Não invente limites, fórmulas, penalidades, restrições ou comportamentos que não tenham sido previamente definidos e aprovados para o produto.
6. Adicione uma linha à tabela acima com o identificador, o título, os requisitos funcionais relacionados (quando houver vínculo validado) e o link relativo para a especificação, por exemplo: `[RN-0007](RN-0007.md)`.

## Vínculos entre regras de negócio e requisitos funcionais

Uma regra de negócio pode se relacionar com um ou mais requisitos funcionais sem repetir o conteúdo deles. Na coluna **Requisitos funcionais relacionados**, referencie apenas vínculos `RN`–`RF` validados, utilizando os identificadores reais e links relativos para as especificações correspondentes em `docs/02-requirements/functional/` (por exemplo, `[RF-0001](../functional/RF-0001.md)`).

Sempre que uma regra de negócio for criada, alterada ou tiver seus vínculos revisados, mantenha este catálogo sincronizado com a especificação individual e com os demais índices de requisitos do projeto.
