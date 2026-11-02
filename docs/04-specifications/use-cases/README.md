# Catálogo de casos de uso

Este catálogo reúne os casos de uso (`UC`) do Orbity, que descrevem as interações entre atores e o sistema: quem participa, o objetivo buscado, as condições necessárias e os resultados esperados. Os passos de interação não são descritos nos casos de uso; eles são especificados nos fluxos (`FL`) relacionados, consultados por links relativos.

| ID | Título do caso de uso | Requisitos funcionais relacionados | Especificação |
| -- | --------------------- | ---------------------------------- | ------------- |
| UC-0001 | Criar tarefa | [RF-0001](../../02-requirements/functional/RF-0001.md), [RF-0013](../../02-requirements/functional/RF-0013.md) | [UC-0001-criar-tarefa.md](UC-0001-criar-tarefa.md) |
| UC-0002 | Consultar tarefas | [RF-0002](../../02-requirements/functional/RF-0002.md) | [UC-0002-consultar-tarefas.md](UC-0002-consultar-tarefas.md) |
| UC-0003 | Editar tarefa | [RF-0003](../../02-requirements/functional/RF-0003.md), [RF-0013](../../02-requirements/functional/RF-0013.md) | [UC-0003-editar-tarefa.md](UC-0003-editar-tarefa.md) |
| UC-0004 | Excluir tarefa | [RF-0004](../../02-requirements/functional/RF-0004.md) | [UC-0004-excluir-tarefa.md](UC-0004-excluir-tarefa.md) |
| UC-0005 | Concluir tarefa | [RF-0005](../../02-requirements/functional/RF-0005.md), [RF-0014](../../02-requirements/functional/RF-0014.md), [RF-0015](../../02-requirements/functional/RF-0015.md) | [UC-0005-concluir-tarefa.md](UC-0005-concluir-tarefa.md) |
| UC-0006 | Reabrir tarefa | [RF-0006](../../02-requirements/functional/RF-0006.md), [RF-0014](../../02-requirements/functional/RF-0014.md) | [UC-0006-reabrir-tarefa.md](UC-0006-reabrir-tarefa.md) |
| UC-0007 | Criar rotina | [RF-0007](../../02-requirements/functional/RF-0007.md), [RF-0012](../../02-requirements/functional/RF-0012.md) | [UC-0007-criar-rotina.md](UC-0007-criar-rotina.md) |
| UC-0008 | Consultar rotinas | [RF-0008](../../02-requirements/functional/RF-0008.md) | [UC-0008-consultar-rotinas.md](UC-0008-consultar-rotinas.md) |
| UC-0009 | Editar rotina | [RF-0009](../../02-requirements/functional/RF-0009.md), [RF-0012](../../02-requirements/functional/RF-0012.md) | [UC-0009-editar-rotina.md](UC-0009-editar-rotina.md) |
| UC-0010 | Excluir rotina | [RF-0010](../../02-requirements/functional/RF-0010.md) | [UC-0010-excluir-rotina.md](UC-0010-excluir-rotina.md) |
| UC-0011 | Concluir ocorrência de rotina | [RF-0011](../../02-requirements/functional/RF-0011.md), [RF-0014](../../02-requirements/functional/RF-0014.md), [RF-0015](../../02-requirements/functional/RF-0015.md) | [UC-0011-concluir-ocorrencia-rotina.md](UC-0011-concluir-ocorrencia-rotina.md) |
| UC-0012 | Realizar sessão de foco | [RF-0001](../../02-requirements/functional/RF-0001.md), [RF-0007](../../02-requirements/functional/RF-0007.md) | [UC-0012-realizar-sessao-foco.md](UC-0012-realizar-sessao-foco.md) |
| UC-0013 | Gerenciar sequência de estudos | [RF-0014](../../02-requirements/functional/RF-0014.md), [RF-0015](../../02-requirements/functional/RF-0015.md) | [UC-0013-gerenciar-sequencia-estudos.md](UC-0013-gerenciar-sequencia-estudos.md) |
| UC-0014 | Explorar constelação | [RF-0015](../../02-requirements/functional/RF-0015.md) | [UC-0014-explorar-constelacao.md](UC-0014-explorar-constelacao.md) |
| UC-0015 | Consultar conquistas | [RF-0015](../../02-requirements/functional/RF-0015.md) | [UC-0015-consultar-conquistas.md](UC-0015-consultar-conquistas.md) |
| UC-0016 | Consultar perfil e métricas | [RF-0015](../../02-requirements/functional/RF-0015.md) | [UC-0016-consultar-perfil-metricas.md](UC-0016-consultar-perfil-metricas.md) |

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
