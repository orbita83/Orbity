# Catálogo de casos de uso

Este catálogo reúne os casos de uso (`UC`) do Orbity, que descrevem as interações entre atores e o sistema: quem participa, o objetivo buscado, as condições necessárias e os resultados esperados. Os passos de interação não são descritos nos casos de uso; eles são especificados nos fluxos (`FL`) relacionados, consultados por links relativos.

O catálogo está vazio: ainda não há casos de uso cadastrados.

| ID | Título do caso de uso | Requisitos funcionais relacionados | Especificação |
| -- | --------------------- | ---------------------------------- | ------------- |

## Como adicionar um caso de uso

1. Crie um caso de uso quando houver uma interação ou objetivo de ator que mereça especificação. Não é obrigatório criar um caso de uso para cada requisito funcional.
2. Escolha o próximo identificador sequencial disponível no formato `UC-0001`, `UC-0002` e assim por diante, sempre com quatro dígitos. O identificador é único, estável, não deve ser reutilizado e corresponde apenas a `UC-XXXX`, independentemente do título no nome do arquivo.
3. Crie o arquivo dentro de `docs/04-specifications/use-cases/` no padrão `UC-XXXX-titulo-curto.md` (sufixo em letras minúsculas, sem acentos e em `kebab-case`), utilizando o template [`UC.template.md`](../../07-templates/UC.template.md).
4. Preencha as seções do template:
   - **1. Identificação:** ID, nome, ator principal e objetivo.
   - **2. Contexto:** finalidade do caso de uso e sua importância para o sistema.
   - **3. Pré-condições:** condições que devem ser satisfeitas antes da execução.
   - **4. Pós-condições:** estado ou resultado esperado após a execução bem-sucedida.
   - **5. Fluxos relacionados:** ID, título e link relativo para cada fluxo em [`../flows/`](../flows/), por exemplo, `[FL-0001](../flows/FL-0001.md)`.
5. Não repita no caso de uso os passos já documentados nos fluxos e não invente fluxos, requisitos ou associações que não tenham sido validados.
6. Adicione uma linha à tabela acima com o identificador, o título, os requisitos funcionais relacionados (ou `—` enquanto não houver vínculo validado) e o link relativo com o **nome completo do arquivo**, por exemplo: `[UC-0001-titulo-curto.md](UC-0001-titulo-curto.md)`.

## Vínculos entre casos de uso, requisitos funcionais e fluxos

Um caso de uso pode se relacionar com um ou mais requisitos funcionais (`RF-XXXX`). Não presuma relações 1:1. Quando houver mais de um vínculo, informe todos os identificadores na coluna **Requisitos funcionais relacionados**, com links relativos para as especificações em `docs/02-requirements/functional/` (por exemplo, `[RF-0001](../../02-requirements/functional/RF-0001.md)`).

Os fluxos relacionados são declarados no próprio documento do caso de uso, na seção **5. Fluxos relacionados**, e os fluxos são catalogados em [`../flows/README.md`](../flows/README.md). Ao criar, alterar ou remover um caso de uso, fluxo ou requisito associado, atualize este catálogo e os documentos envolvidos para manter os vínculos consistentes. Não mantenha associações que deixaram de ser válidas.
