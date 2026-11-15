# Catálogo de fluxos

Este catálogo reúne os fluxos do Orbity e relaciona cada fluxo aos requisitos correspondentes. Cada funcionalidade deve ser documentada em um único arquivo FL, com seus fluxos principal, alternativos e de exceção.

| ID | Título | Requisito relacionado | Arquivo FL |
| -- | ------ | --------------------- | ---------- |
| FL-0001 | Criação de tarefa | — | [FL-0001](FL-0001.md) |
| FL-0002 | Consulta e filtragem de tarefas | — | [FL-0002](FL-0002.md) |
| FL-0003 | Conclusão e desmarcação de tarefa | — | [FL-0003](FL-0003.md) |
| FL-0004 | Seleção múltipla e ações contextuais de tarefas | — | [FL-0004](FL-0004.md) |
| FL-0005 | Criação de rotina | — | [FL-0005](FL-0005.md) |
| FL-0006 | Consulta e detalhamento de rotinas | — | [FL-0006](FL-0006.md) |
| FL-0007 | Edição de rotina | — | [FL-0007](FL-0007.md) |
| FL-0008 | Conclusão de rotina | — | [FL-0008](FL-0008.md) |
| FL-0009 | Consulta da tela inicial e painel deslizante | — | [FL-0009](FL-0009.md) |
| FL-0010 | Início de sessão do modo foco | — | [FL-0010](FL-0010.md) |
| FL-0011 | Atualização automática da sequência | — | [FL-0011](FL-0011.md) |
| FL-0012 | Exploração da constelação | — | [FL-0012](FL-0012.md) |
| FL-0013 | Consulta e compartilhamento de conquistas | — | [FL-0013](FL-0013.md) |
| FL-0014 | Consulta do perfil | — | [FL-0014](FL-0014.md) |

## Como adicionar um fluxo

1. Escolha o próximo identificador sequencial disponível no formato `FL-0001`, `FL-0002` e assim por diante, sempre com quatro dígitos.
2. Crie um arquivo com o mesmo identificador neste diretório, por exemplo, `FL-0001.md`, usando o template `docs/07-templates/FL.template.md`.
3. Adicione uma linha à tabela acima com o identificador, o título, o requisito relacionado e um link para o arquivo FL, por exemplo: [FL-0001](FL-0001.md). Registre somente vínculos confirmados com requisitos; não deduza nem invente associações.

## Vínculos entre fluxos e requisitos

Ao criar, alterar ou remover um fluxo ou requisito associado, atualize o catálogo e os documentos envolvidos para manter os vínculos consistentes. Use os identificadores reais e links relativos válidos. Quando um fluxo se relacionar a mais de um requisito, informe todos os identificadores correspondentes na coluna **Requisito relacionado** e mantenha as referências atualizadas nos documentos pertinentes. Não mantenha associações que deixaram de ser válidas.
