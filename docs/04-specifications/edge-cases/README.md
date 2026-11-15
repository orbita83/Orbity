# Catálogo de casos de borda (Edge Cases)

Este catálogo reúne os casos de borda (`EC`) do Orbity, especificando condições incomuns, extremas ou limítrofes das funcionalidades e o comportamento verificável esperado do sistema. Cada documento aborda uma única condição de borda e complementa os requisitos, as regras de negócio e os fluxos do projeto, permitindo que desenvolvedores e agentes de IA consultem individualmente apenas os cenários relevantes.

| ID | Título do caso de borda | RF relacionado | Regras de negócio relacionadas | Especificação |
| -- | ----------------------- | -------------- | ------------------------------ | ------------- |
| EC-0001 | Tentativa de iniciar modo foco sem tarefa ou rotina vinculada | — | [RN-0001](../../02-requirements/business-rules/RN-0001.md) | [EC-0001-inicio-modo-foco-sem-tarefa-ou-rotina.md](EC-0001-inicio-modo-foco-sem-tarefa-ou-rotina.md) |
| EC-0002 | Contabilização de sequência quando há apenas rotina ou apenas tarefa avulsa | — | [RN-0002](../../02-requirements/business-rules/RN-0002.md), [RN-0003](../../02-requirements/business-rules/RN-0003.md) | [EC-0002-contabilizacao-sequencia-apenas-rotina-ou-apenas-tarefa.md](EC-0002-contabilizacao-sequencia-apenas-rotina-ou-apenas-tarefa.md) |
| EC-0003 | Conclusão de apenas uma categoria quando existem rotina e tarefa avulsa | — | [RN-0002](../../02-requirements/business-rules/RN-0002.md), [RN-0003](../../02-requirements/business-rules/RN-0003.md), [RN-0004](../../02-requirements/business-rules/RN-0004.md) | [EC-0003-conclusao-parcial-entre-rotina-e-tarefa-avulsa.md](EC-0003-conclusao-parcial-entre-rotina-e-tarefa-avulsa.md) |
| EC-0004 | Múltiplas conclusões de tarefas e rotinas após incremento da sequência no mesmo ciclo | — | [RN-0002](../../02-requirements/business-rules/RN-0002.md), [RN-0003](../../02-requirements/business-rules/RN-0003.md), [RN-0005](../../02-requirements/business-rules/RN-0005.md) | [EC-0004-multiplas-conclusoes-no-mesmo-dia.md](EC-0004-multiplas-conclusoes-no-mesmo-dia.md) |
| EC-0005 | Conclusão de rotina quando parte das tarefas associadas já está concluída | — | [RN-0004](../../02-requirements/business-rules/RN-0004.md) | [EC-0005-conclusao-rotina-com-tarefas-ja-concluidas.md](EC-0005-conclusao-rotina-com-tarefas-ja-concluidas.md) |
| EC-0006 | Reabertura de tarefa associada após a conclusão da rotina | — | [RN-0004](../../02-requirements/business-rules/RN-0004.md) | [EC-0006-desmarcar-tarefa-associada-apos-conclusao-da-rotina.md](EC-0006-desmarcar-tarefa-associada-apos-conclusao-da-rotina.md) |
| EC-0007 | Encerramento ou interrupção de sessão ativa do modo foco | — | [RN-0001](../../02-requirements/business-rules/RN-0001.md), [RN-0006](../../02-requirements/business-rules/RN-0006.md) | [EC-0007-interrupcao-sessao-modo-foco-em-andamento.md](EC-0007-interrupcao-sessao-modo-foco-em-andamento.md) |
| EC-0008 | Exclusão de tarefa ou rotina vinculada a uma sessão ativa do modo foco | — | [RN-0001](../../02-requirements/business-rules/RN-0001.md), [RN-0006](../../02-requirements/business-rules/RN-0006.md) | [EC-0008-alteracao-tarefa-ou-rotina-vinculada-ao-modo-foco.md](EC-0008-alteracao-tarefa-ou-rotina-vinculada-ao-modo-foco.md) |

## Como adicionar um caso de borda

1. Escolha o próximo identificador sequencial disponível no formato `EC-0001`, `EC-0002` e assim por diante, sempre com quatro dígitos. O identificador é único, estável e independente do título no nome do arquivo.
2. Crie o arquivo dentro de `docs/04-specifications/edge-cases/` no padrão `EC-XXXX-titulo-curto.md` (com o sufixo em letras minúsculas, sem acentos e em `kebab-case`), utilizando o template [`EC.template.md`](../../07-templates/EC.template.md).
3. Especifique **apenas uma condição de borda por documento**, sem misturar cenários independentes.
4. Preencha as quatro seções do template:
   - **1. Contexto:** funcionalidade ou situação em que o caso de borda pode ocorrer.
   - **2. Condição de borda:** cenário específico, incomum ou limítrofe que precisa ser tratado pelo sistema.
   - **3. Comportamento esperado:** resposta do sistema com base nas regras e nos requisitos aprovados.
   - **4. Critérios de aceite:** condições verificáveis identificadas como `CA-01`, `CA-02` etc., na quantidade necessária para validar o cenário (os itens do template são exemplos editáveis, sem quantidade fixa obrigatória).
5. Não invente limites numéricos, tempos, quantidades, validações ou tratamentos não definidos e aprovados; caso algum detalhe dependa de decisão futura, registre-o explicitamente como *ponto pendente de refinamento*.
6. Adicione uma linha à tabela acima informando o ID, o título, os requisitos ou regras relacionados e o link relativo com o nome completo do arquivo.

## Rastreabilidade com requisitos, regras de negócio e casos de uso

Um mesmo requisito funcional (`RF-XXXX`), regra de negócio (`RN-XXXX`) ou caso de uso (`UC-XXXX`) pode estar associado a múltiplos casos de borda. Mantenha os vínculos na tabela atualizados apenas com artefatos e relações validados, utilizando links relativos funcionais para permitir a navegação direta entre especificações.
